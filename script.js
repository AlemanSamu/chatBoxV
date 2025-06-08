document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Estado del chat para manejar flujos conversacionales (como la encuesta)
    let chatState = {
        awaitingSurveyConfirmation: false, // Para saber si estamos esperando un 'sí' o 'no' para la encuesta
        currentSurveyQuestionIndex: -1    // Índice de la pregunta actual de la encuesta (-1 significa ninguna encuesta activa)
    };

    // Preguntas de la encuesta de satisfacción
    const surveyQuestions = [
        "1. ¿Cómo calificarías tu experiencia con nuestro servicio al cliente? (del 1 al 5, donde 5 es excelente)",
        "2. ¿Te sentiste atendido y escuchado durante la conversación? (Sí/No)",
        "3. ¿Tu pregunta o problema fue resuelto de manera satisfactoria? (Sí/No)",
        "4. ¿Tienes algún comentario o sugerencia para mejorar nuestro servicio al cliente? ¡Nos encantaría escucharte!"
    ];

    // Base de conocimientos con las preguntas y respuestas del chatbox
    // ¡IMPORTANTE!: El orden importa. Las preguntas más específicas deben ir primero.
    const knowledgeBase = [
        {
            keywords: ["puedo obtener ayuda para elegir un producto", "ayuda para elegir un producto", "ayuda elegir producto", "elegir producto", "recomendar producto"],
            response: "Sí, estaríamos encantados de ayudarte a elegir un producto que se adapte a tus necesidades. ¿Podrías proporcionarnos más información sobre lo que estás buscando?"
        },
        {
            keywords: ["cual es el precio de envío", "cual es el precio de envio", "precio de envío", "precio de envio", "costo de envío", "costo de envio"],
            response: "Nuestros precios de envío varían según la ubicación y el peso del paquete. Me puedes proporcionar la dirección de destino de tu compra para obtener una estimación del costo de envío."
        },
        {
            keywords: ["puedo cancelar mi pedido", "cancelar mi pedido"],
            response: "Sí, puedes cancelar tu pedido si aún no ha sido enviado. ¿Deseas conocer el estado de tu pedido? “"
        },
        {
            keywords: ["cual es el estado de mi pedido", "estado de mi pedido"],
            response: "Por favor, proporcionanos tu número de pedido o información de seguimiento para que podamos veriﬁcar su estado."
        },
        {
            keywords: ["que pasa si mi producto llega dañado", "producto llega dañado", "producto dañado"],
            response: "En caso de que tu pedido llegue en mal estado puedes hacer la devolución del producto y te atenderemos en caso de que desees la devolución del dinero o el envío de un nuevo producto."
        },
        {
            keywords: ["puedo devolver o cambiar un producto", "devolver o cambiar un producto", "devolver producto", "cambiar producto"],
            response: "Sí, puedes devolver o cambiar un producto dentro de un lapso de 30 días después de la compra. Por favor, consulta nuestra política de devoluciones y cambios para más información."
        },
        {
            keywords: ["puedo obtener un reembolso si no estoy satisfecho con mi compra", "reembolso si no estoy satisfecho con mi compra", "obtener un reembolso", "reembolso", "no estoy satisfecho"],
            response: "Sí, ofrecemos una garantía de satisfacción. Puedes consultar nuestra política de devoluciones y cambios para más información."
        },
        {
            keywords: ["cómo puedo rastrear mi pedido", "como puedo rastrear mi pedido", "rastrear mi pedido"],
            response: "Puedes rastrear tu pedido utilizando el número de seguimiento del paquete en la página de la empresa de mensajería”"
        },
        {
            keywords: ["cómo puedo contactar con un representante de servicio al cliente", "como puedo contactar con un representante de servicio al cliente", "contactar representante", "servicio al cliente"],
            response: "Puedes contactarnos a través de este chat, ¿Deseas ser atendido por uno de nuestros asesores?"
        },
        {
            // Esta respuesta se activa cuando el usuario agradece o finaliza la conversación.
            // Activa el estado 'awaitingSurveyConfirmation' para preguntar sobre la encuesta.
            keywords: ["gracias", "muchas gracias", "te lo agradezco", "ok", "listo", "perfecto", "adios", "chao", "bye", "nos vemos"],
            response: "¡De nada! ¡Es un placer enorme ayudarte! Me alegra haber podido resolver tu duda. Antes de que te vayas, ¿te importaría regalarnos unos segundos de tu tiempo para una pequeña encuesta sobre tu experiencia con Sorel-chat? ¡Tu opinión nos ayuda muchísimo a mejorar! Solo di 'sí' o 'no'. ✨"
        },
        {
            // Esta respuesta es específica si el usuario pregunta directamente por la encuesta.
            // No activa el estado 'awaitingSurveyConfirmation' ya que la pregunta ya fue hecha.
            keywords: ["encuesta de satisfacción", "calificar servicio", "experiencia", "quiero hacer la encuesta"],
            response: "¡Me encantaría saber tu opinión! Si estás listo para la encuesta, por favor, responde 'sí' a mi pregunta anterior (si ya te la hice). ¡Tu feedback es muy valioso para nosotros! 💖"
        },
        {
            // Mensaje de bienvenida inicial del bot al cargar la página
            // Esta es la penúltima entrada para que solo se active con saludos directos si no hay otra coincidencia.
            keywords: ["hola", "saludo", "que tal", "buenos dias", "buenas tardes", "buenas noches"],
            response: "¡Hola! ¡Qué gusto verte por aquí! Soy Sorel, tu ayudante de ropa urbana, y estoy listo para ayudarte con lo que necesites sobre nuestros productos, pedidos o cualquier otra consulta. ¿En qué podría asesorarte el día de hoy? 😊"
        },
        {
            // Respuesta por defecto si no se encuentra ninguna coincidencia específica
            keywords: [], // No tiene palabras clave, es el último recurso.
            response: "¡Uy, perdona! Parece que no entendí muy bien tu pregunta. ¿Podrías intentar formularla de otra manera o preguntar sobre algo más? ¡Estoy aquí para ayudarte! 🤔"
        }
    ];

    // Función para añadir un mensaje al chat
    function addMessage(text, sender = 'bot') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message-bubble');
        if (sender === 'user') {
            messageElement.classList.add('user-message'); // Aplica estilos para mensajes de usuario
        } else {
            messageElement.classList.add('bot-message'); // Aplica estilos para mensajes del bot
        }
        messageElement.textContent = text; // Establece el texto del mensaje
        chatMessages.appendChild(messageElement); // Añade el mensaje al contenedor de mensajes

        // Desplaza el chat automáticamente hacia abajo para ver el último mensaje
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Función para iniciar la encuesta (muestra la primera pregunta)
    function startSurvey() {
        chatState.awaitingSurveyConfirmation = false; // Ya no esperamos la confirmación de la encuesta
        chatState.currentSurveyQuestionIndex = 0; // Establece el índice a la primera pregunta

        setTimeout(() => {
            addMessage("¡Perfecto! Aquí tienes unas preguntas rápidas. Tu honestidad nos ayuda a crecer:", 'bot');
            setTimeout(() => {
                addMessage(surveyQuestions[chatState.currentSurveyQuestionIndex], 'bot');
            }, 800); // Retraso antes de la primera pregunta de la encuesta
        }, 500);
    }

    // Lógica para procesar la entrada del usuario y generar una respuesta del bot
    function processUserInput() {
        const message = userInput.value.trim(); // Obtiene el texto del input y elimina espacios al inicio/final
        if (message === "") return; // Si el mensaje está vacío, no hace nada

        addMessage(message, 'user'); // Añade el mensaje del usuario al chat
        userInput.value = ''; // Limpia el campo de entrada

        const lowerCaseMessage = message.toLowerCase(); // Convierte el mensaje a minúsculas para una mejor comparación

        // **PRIORIDAD 1: Manejo de la confirmación de la encuesta (sí/no inicial)**
        if (chatState.awaitingSurveyConfirmation) {
            if (lowerCaseMessage === 'sí' || lowerCaseMessage === 'si') {
                addMessage("¡Genial! Me alegro que quieras ayudarnos. ¡Empecemos! 🎉", 'bot');
                startSurvey(); // Llama a la función para iniciar la encuesta
                return; // Termina la función aquí, ya que la encuesta ha comenzado
            } else if (lowerCaseMessage === 'no') {
                addMessage("¡Entendido! No te preocupes, quizás en otra ocasión. ¡Que tengas un excelente día! 👋", 'bot');
                chatState.awaitingSurveyConfirmation = false; // Resetea el estado
                chatState.currentSurveyQuestionIndex = -1; // Asegura que no haya encuesta activa
                return; // Termina la función aquí, ya que el usuario ha declinado
            } else {
                // Si el usuario escribe algo diferente a 'sí'/'no' mientras se espera la confirmación de la encuesta,
                // asumimos que ha cambiado de tema. Se resetea el estado de la encuesta y se continúa procesando la nueva pregunta.
                addMessage("Parece que tienes otra pregunta. No hay problema. 😊", 'bot'); // Mensaje de transición amigable
                chatState.awaitingSurveyConfirmation = false; // Resetea el estado
                chatState.currentSurveyQuestionIndex = -1; // Asegura que no haya encuesta activa
                // CONTINÚA LA FUNCIÓN para buscar en la base de conocimientos
            }
        }

        // **PRIORIDAD 2: Manejo de las preguntas individuales de la encuesta**
        if (chatState.currentSurveyQuestionIndex !== -1) {
            // Aquí puedes opcionalmente guardar la respuesta del usuario si tuvieras un backend
            // console.log(`Respuesta a la pregunta ${chatState.currentSurveyQuestionIndex + 1}: ${message}`);

            chatState.currentSurveyQuestionIndex++; // Pasa a la siguiente pregunta

            setTimeout(() => {
                if (chatState.currentSurveyQuestionIndex < surveyQuestions.length) {
                    addMessage(surveyQuestions[chatState.currentSurveyQuestionIndex], 'bot'); // Muestra la siguiente pregunta
                } else {
                    addMessage("¡Muchas gracias por tu tiempo y tu valiosa opinión! 😊", 'bot'); // Mensaje final de agradecimiento
                    chatState.currentSurveyQuestionIndex = -1; // Resetea el índice, la encuesta ha terminado
                }
            }, 800); // Retraso antes de la siguiente pregunta/agradecimiento
            return; // Termina la función aquí, ya que se manejó una respuesta de encuesta
        }

        // **PRIORIDAD 3: Buscar en la base de conocimientos para todas las demás preguntas**
        let botResponse = "¡Uy, perdona! Parece que no entendí muy bien tu pregunta. ¿Podrías intentar formularla de otra manera o preguntar sobre algo más? ¡Estoy aquí para ayudarte! 🤔"; 
        let shouldAskForSurvey = false; // Flag para activar la encuesta después de la respuesta

        // El último elemento de knowledgeBase siempre será la respuesta por defecto.
        const defaultResponseEntry = knowledgeBase[knowledgeBase.length - 1];
        // La penúltima es el saludo general.
        const greetingEntry = knowledgeBase[knowledgeBase.length - 2]; 

        // Filtra la base de conocimientos para excluir la respuesta por defecto y el saludo general
        const relevantKnowledgeBase = knowledgeBase.slice(0, knowledgeBase.length - 2); 

        // Primero, busca en las respuestas específicas (agradecimientos y encuestas)
        for (const entry of relevantKnowledgeBase) {
            const foundKeyword = entry.keywords.some(keyword => lowerCaseMessage.includes(keyword));
            if (foundKeyword) {
                botResponse = entry.response;
                
                // Si la respuesta encontrada es una de las "gracias" o finalización,
                // entonces activamos la bandera para preguntar por la encuesta.
                const thankYouKeywords = ["gracias", "muchas gracias", "ok", "listo", "perfecto", "adios", "chao", "bye", "nos vemos"];
                if (entry.keywords.some(k => thankYouKeywords.includes(k))) {
                    shouldAskForSurvey = true;
                }
                break; // Sale del bucle una vez que se encuentra una coincidencia
            }
        }

        // Si no se encontró una respuesta en las entradas específicas de agradecimiento/encuesta
        // y el mensaje del usuario es un saludo exacto, usa la respuesta de saludo.
        const exactGreetingKeywords = ["hola", "saludo", "que tal", "buenos dias", "buenas tardes", "buenas noches"];
        if (botResponse === defaultResponseEntry.response && exactGreetingKeywords.some(keyword => lowerCaseMessage === keyword)) {
            botResponse = greetingEntry.response;
        } 
        // Si no es un saludo exacto y no se encontró una respuesta específica, usa la respuesta por defecto.
        else if (botResponse === defaultResponseEntry.response) {
            botResponse = defaultResponseEntry.response;
        }

        // Simula un pequeño retraso antes de que el bot responda, para una experiencia más natural
        setTimeout(() => {
            addMessage(botResponse, 'bot');
            // Si la bandera está activa, entonces configuramos el estado para esperar la confirmación de la encuesta.
            if (shouldAskForSurvey) {
                chatState.awaitingSurveyConfirmation = true;
            }
        }, 800); // Retraso para un toque más "humano"
    }

    // Event listener para el botón de enviar
    sendButton.addEventListener('click', processUserInput);

    // Event listener para la tecla 'Enter' en el campo de entrada
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processUserInput();
        }
    });

    // Mensaje de bienvenida inicial del bot al cargar la página
    // Este mensaje se coloca aquí para que solo se envíe una vez al inicio.
    addMessage("¡Hola! ¡Qué gusto verte por aquí! Soy Sorel, tu ayudante de ropa urbana, y estoy listo para ayudarte con lo que necesites sobre nuestros productos, pedidos o cualquier otra consulta. ¿En qué podría asesorarte el día de hoy? 😊", 'bot');
});
