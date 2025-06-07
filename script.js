document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Estado del chat para manejar flujos conversacionales (como la encuesta)
    let chatState = {
        awaitingSurveyConfirmation: false // Para saber si estamos esperando un 'sí' o 'no' para la encuesta
    };

    // Preguntas de la encuesta de satisfacción
    const surveyQuestions = [
        "1. ¿Cómo calificarías tu experiencia general con nuestro servicio de atención al cliente? (del 1 al 5, donde 5 es excelente)",
        "2. ¿La información que te proporcioné fue clara y fácil de entender? (Sí/No)",
        "3. ¿Tu pregunta o problema fue resuelto de manera satisfactoria por el asistente? (Sí/No)",
        "4. ¿Qué tan probable es que uses este asistente nuevamente para futuras consultas? (del 1 al 5, donde 5 es muy probable)",
        "5. ¿Tienes alguna sugerencia para mejorar nuestro servicio o la experiencia con el asistente? ¡Nos encantaría escucharte!"
    ];

    // Base de conocimientos con preguntas preinstaladas y sus respuestas
    const knowledgeBase = [
        {
            keywords: ["hola", "saludo", "ayuda", "qué tal", "que tal", "buenos días", "buenas tardes", "buenas noches", "necesito ayuda", "puedes ayudarme"],
            response: "¡Hola! ¡Qué gusto verte por aquí! Soy tu asistente virtual de Estilo Urbano y estoy listo para ayudarte con lo que necesites sobre nuestros productos, pedidos o cualquier otra consulta. ¿En qué te puedo echar una mano hoy?"
        },
        {
            keywords: ["elegir producto", "ayuda producto", "recomendar producto", "qué me recomiendas", "consejo producto", "asesoría", "escoger ropa"],
            response: "¡Claro que sí, me encanta ayudarte a encontrar la prenda perfecta! Para que pueda orientarte de maravilla, ¿podrías contarme un poquito más sobre lo que buscas? Por ejemplo, ¿qué tipo de ropa te interesa (casual, formal, deportiva), para qué ocasión la necesitas, o qué estilo te gusta?"
        },
        {
            keywords: ["precio envío", "costo envío", "cuánto cuesta envío", "envío", "despacho", "gastos envío", "costo de envío"],
            response: "Los costos de envío son flexibles y se calculan con cariño según tu ubicación y el peso de tu paquete. Para darte una estimación súper precisa, ¿me podrías indicar amablemente la dirección de destino de tu compra?"
        },
        {
            keywords: ["cancelar pedido", "anular pedido", "quitar pedido", "deshacer pedido"],
            response: "Sí, es posible cancelar tu pedido, ¡no te preocupes! Eso sí, debe ser antes de que haya sido enviado. ¿Te gustaría que verifiquemos junt@s el estado actual de tu pedido?"
        },
        {
            keywords: ["estado pedido", "rastrear pedido", "dónde está mi pedido", "mi pedido", "estado de mi pedido"],
            response: "¡Claro que sí! Para que pueda ayudarte a verificar el estado de tu pedido rápidamente, por favor, proporciónanos tu número de pedido o cualquier información de seguimiento que tengas. ¡Así lo encontramos de inmediato!"
        },
        {
            keywords: ["producto dañado", "roto", "defectuoso", "mal estado", "llegó mal", "prenda dañada", "imperfección"],
            response: "¡Oh, no! ¡Lamentamos muchísimo escuchar eso! Si tu producto llega en mal estado, por supuesto que puedes solicitar una devolución. Con gusto te ayudaremos con un reembolso total o te enviaremos un producto nuevo, ¡lo que te venga mejor!"
        },
        {
            keywords: ["devolver producto", "cambiar producto", "hacer devolución", "política de cambios", "política de devoluciones", "quiero devolver", "cambiar prenda"],
            response: "¡Por supuesto que sí! Puedes devolver o cambiar un producto sin problema dentro de los 30 días posteriores a la compra. Te invitamos con gusto a consultar nuestra 'Política de Devoluciones y Cambios' en nuestra web para conocer todos los detalles y los sencillos pasos a seguir."
        },
        {
            keywords: ["reembolso", "no satisfecho", "garantía", "dinero de vuelta", "garantía de satisfacción", "no me gusta"],
            response: "¡Absolutamente! Tu satisfacción es nuestra prioridad número uno, por eso ofrecemos una garantía total de satisfacción. Para más información sobre cómo obtener un reembolso, te invito a revisar nuestra 'Política de Devoluciones y Cambios' en nuestra página. ¡Queremos que te sientas feliz con tu compra!"
        },
        {
            keywords: ["rastrear mi pedido", "seguir pedido", "número de seguimiento", "dónde va mi paquete"],
            response: "¡Es súper fácil! Puedes rastrear tu pedido utilizando el número de seguimiento que te proporcionamos en el email de confirmación. Solo tienes que ingresarlo en la página de la empresa de mensajería para ver su ubicación actual. ¿Necesitas que te ayude a encontrar tu número de seguimiento?"
        },
        {
            keywords: ["contactar asesor", "hablar con humano", "servicio cliente", "agente", "representante", "hablar con una persona", "ayuda personal"],
            response: "¡Claro que sí! Si prefieres hablar con una persona, con gusto te conectaremos. ¿Te gustaría ser atendido por uno de nuestros amables asesores en este momento? Solo dime 'sí' o 'no'."
        },
        {
            keywords: ["pago", "métodos de pago", "forma de pago", "pagar", "seguridad pago", "cómo pagar"],
            response: "Aceptamos una variedad de métodos de pago para tu comodidad: tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal y transferencias bancarias. ¡Todas tus transacciones son 100% seguras con nosotros! Puedes ver todas las opciones al finalizar tu compra."
        },
        {
            keywords: ["horario", "horas", "abierto", "cerrado", "atención", "a qué hora abren"],
            response: "Nuestra tienda de ropa online está abierta 24/7 para que puedas comprar cuando quieras. Para atención al cliente personalizada, nuestro horario es de Lunes a Viernes de 9:00 AM a 6:00 PM (hora local). ¡Siempre listos para ayudarte!"
        },
        {
            keywords: ["cuenta", "mi cuenta", "registro", "iniciar sesión", "password", "contraseña"],
            response: "Para acceder a tu cuenta, haz clic en 'Iniciar Sesión' en la parte superior derecha de la página. Si olvidaste tu contraseña, ¡no hay problema!, usa la opción 'Recuperar contraseña' y te enviaremos las instrucciones."
        },
        {
            keywords: ["ropa de hombre", "moda masculina", "camisas hombre", "pantalones hombre", "colección hombre"],
            response: "¡Claro! Nuestra sección de ropa de hombre está llena de opciones increíbles: tenemos una gran variedad de camisas, pantalones, chaquetas y accesorios con las últimas tendencias urbanas. ¡Seguro encuentras algo que te encantará!"
        },
        {
            keywords: ["ropa de mujer", "moda femenina", "vestidos", "faldas", "tops mujer", "colección mujer"],
            response: "Descubre nuestra fabulosa colección de ropa de mujer con vestidos, faldas, tops y prendas exclusivas que combinan estilo y comodidad para cualquier ocasión. ¡Siempre a la moda con Estilo Urbano!"
        },
        {
            // Modificada la respuesta para preguntar sobre la encuesta
            keywords: ["gracias", "muchas gracias", "te lo agradezco", "ok", "listo"],
            response: "¡De nada! ¡Es un placer enorme ayudarte! Me alegra haber podido resolver tu duda. Antes de que te vayas, ¿te importaría regalarnos unos segundos de tu tiempo para una pequeña encuesta sobre tu experiencia con el asistente? ¡Tu opinión nos ayuda muchísimo a mejorar! Solo di 'sí' o 'no'."
        },
        {
            keywords: ["encuesta de satisfacción", "calificar servicio", "experiencia"],
            response: "¡Me encantaría saber tu opinión! Aunque por ahora no puedo registrar tu respuesta directamente en una encuesta, me ayudaría mucho si pudieras decirme: ¿Cómo calificarías tu experiencia con nuestro servicio? (1-5, siendo 5 excelente). ¡Tu feedback es muy valioso para nosotros!"
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

    // Función para mostrar las preguntas de la encuesta
    function startSurvey() {
        // Reinicia el estado de la encuesta después de mostrarla
        chatState.awaitingSurveyConfirmation = false;
        setTimeout(() => {
            addMessage("¡Perfecto! Aquí tienes unas preguntas rápidas. Tu honestidad nos ayuda a crecer:", 'bot');
            setTimeout(() => {
                surveyQuestions.forEach((q, index) => {
                    setTimeout(() => {
                        addMessage(q, 'bot');
                        if (index === surveyQuestions.length - 1) {
                            // Mensaje final después de la última pregunta
                            setTimeout(() => {
                                addMessage("¡Muchas gracias por tu tiempo y tu valiosa opinión!", 'bot');
                            }, 500); // Pequeño retraso antes del agradecimiento final
                        }
                    }, index * 1000); // Muestra cada pregunta con un segundo de retraso
                });
            }, 800); // Retraso antes de la primera pregunta de la encuesta
        }, 500); // Retraso general para que la confirmación se procese
    }


    // Lógica para procesar la entrada del usuario y generar una respuesta del bot
    function processUserInput() {
        const message = userInput.value.trim(); // Obtiene el texto del input y elimina espacios al inicio/final
        if (message === "") return; // Si el mensaje está vacío, no hace nada

        addMessage(message, 'user'); // Añade el mensaje del usuario al chat
        userInput.value = ''; // Limpia el campo de entrada

        const lowerCaseMessage = message.toLowerCase(); // Convierte el mensaje a minúsculas para una mejor comparación

        // Manejo de la confirmación de la encuesta
        if (chatState.awaitingSurveyConfirmation) {
            if (lowerCaseMessage === 'sí' || lowerCaseMessage === 'si') {
                addMessage("¡Genial! Me alegro que quieras ayudarnos.", 'bot');
                startSurvey(); // Llama a la función para iniciar la encuesta
                return; // Termina la función aquí, ya que la encuesta ha comenzado
            } else if (lowerCaseMessage === 'no') {
                addMessage("¡Entendido! No te preocupes, quizás en otra ocasión. ¡Que tengas un excelente día!", 'bot');
                chatState.awaitingSurveyConfirmation = false; // Resetea el estado
                return; // Termina la función aquí, ya que el usuario ha declinado
            } else {
                // Si el usuario escribe algo diferente a 'sí'/'no' mientras se espera la confirmación de la encuesta,
                // asumimos que ha cambiado de tema.
                addMessage("Parece que tienes otra pregunta. No hay problema. 😊", 'bot'); // Mensaje de transición amigable
                chatState.awaitingSurveyConfirmation = false; // Resetea el estado para que el bot pueda buscar en la base de conocimientos
                // CONTINÚA LA FUNCIÓN para buscar en la base de conocimientos
            }
        }

        // Respuesta por defecto si no se encuentra una coincidencia, con tono amigable
        let botResponse = "¡Uy, perdona! Parece que no entendí muy bien tu pregunta. ¿Podrías intentar formularla de otra manera o preguntar sobre algo más? ¡Estoy aquí para ayudarte!"; 

        // Busca una coincidencia en la base de conocimientos
        for (const entry of knowledgeBase) {
            // Comprueba si alguna de las palabras clave de la entrada está contenida en el mensaje del usuario
            const foundKeyword = entry.keywords.some(keyword => lowerCaseMessage.includes(keyword));
            if (foundKeyword) {
                botResponse = entry.response; // Asigna la respuesta encontrada
                
                // Si la respuesta es el agradecimiento (o cualquier palabra clave que active la encuesta),
                // activa el estado para esperar la confirmación de la encuesta
                if (entry.keywords.includes("gracias") || entry.keywords.includes("muchas gracias") || entry.keywords.includes("ok")) {
                    chatState.awaitingSurveyConfirmation = true;
                }
                break; // Sale del bucle una vez que se encuentra una coincidencia
            }
        }

        // Simula un pequeño retraso antes de que el bot responda, para una experiencia más natural
        setTimeout(() => {
            addMessage(botResponse, 'bot');
        }, 800); // Aumento el retraso para un toque más "humano"
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
    addMessage("¡Hola! ¡Qué gusto verte por aquí! Soy tu asistente virtual de Estilo Urbano y estoy listo para ayudarte con lo que necesites sobre nuestros productos, pedidos o cualquier otra consulta. ¿En qué te puedo echar una mano hoy?", 'bot');
});
