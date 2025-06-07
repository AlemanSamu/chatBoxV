document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Base de conocimientos con preguntas preinstaladas y sus respuestas
    // Cada entrada tiene una lista de palabras clave para buscar y la respuesta correspondiente
    const knowledgeBase = [
        {
            keywords: ["hola", "saludo", "ayuda", "qué tal", "que tal", "buenos días", "buenas tardes", "buenas noches"],
            response: "¡Hola! Soy tu asistente virtual en Estilo Urbano. Estoy aquí para ayudarte con cualquier duda sobre nuestros productos, pedidos o envíos. ¿En qué puedo ayudarte hoy?"
        },
        {
            keywords: ["envío", "despacho", "entrega", "cuánto tarda", "costo de envío", "envio", "costo envio", "seguimiento"],
            response: "Nuestros tiempos de envío varían según tu ubicación. Para envíos nacionales, el plazo es de 3-5 días hábiles. El costo de envío se calculará en el checkout. Recibirás un enlace de seguimiento por email."
        },
        {
            keywords: ["devolución", "cambio", "reembolso", "garantía", "devolver", "cambiar", "política de devoluciones"],
            response: "Puedes solicitar una devolución o cambio en un plazo de 30 días desde la fecha de compra, siempre y cuando la prenda no haya sido usada y conserve sus etiquetas. Visita nuestra sección de 'Devoluciones y Cambios' en la web para más información."
        },
        {
            keywords: ["talla", "medida", "tamaño", "guía de tallas", "como elegir talla", "calzado"],
            response: "En cada página de producto encontrarás una guía de tallas detallada para ayudarte a elegir la prenda perfecta. Si tienes dudas, puedes consultar nuestras medidas exactas o contactar a un asesor de ventas."
        },
        {
            keywords: ["productos", "catálogo", "colección", "ropa", "verano", "invierno", "nuevos", "prendas", "tipos de ropa", "accesorios", "calzado"],
            response: "Ofrecemos una amplia variedad de ropa para hombres y mujeres, desde moda casual hasta prendas de vestir elegantes, además de accesorios y calzado. ¡Explora nuestras últimas colecciones de temporada!"
        },
        {
            keywords: ["ofertas", "descuentos", "promociones", "rebajas", "cupón", "promo"],
            response: "Sí, siempre tenemos promociones especiales. Te recomendamos suscribirte a nuestro boletín para recibir notificaciones sobre descuentos exclusivos y nuevas llegadas. ¡No te pierdas las rebajas!"
        },
        {
            keywords: ["gracias", "muchas gracias", "te lo agradezco"],
            response: "De nada, ¡es un placer ayudarte! Si tienes más preguntas, no dudes en consultarme."
        },
        {
            keywords: ["pago", "métodos de pago", "forma de pago", "pagar", "seguridad pago"],
            response: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express), PayPal y transferencias bancarias. Todas nuestras transacciones son 100% seguras. Puedes ver todas las opciones en el checkout."
        },
        {
            keywords: ["contacto", "llamar", "correo", "email", "hablar con alguien", "soporte"],
            response: "Puedes contactarnos a través de nuestro formulario en línea, por correo electrónico a soporte@estilourbano.com o llamando al +57 (310) 123-4567."
        },
        {
            keywords: ["horario", "horas", "abierto", "cerrado", "atención"],
            response: "Nuestra Tienda de Ropa está abierta 24/7 para tus compras. Para atención al cliente personalizada, nuestro horario es de Lunes a Viernes de 9:00 AM a 6:00 PM (hora local)."
        },
        {
            keywords: ["cuenta", "mi cuenta", "registro", "iniciar sesión", "password"],
            response: "Para acceder a tu cuenta, haz clic en 'Iniciar Sesión' en la parte superior derecha de la página. Si olvidaste tu contraseña, usa la opción 'Recuperar contraseña'."
        },
        {
            keywords: ["ropa de hombre", "moda masculina", "camisas hombre", "pantalones hombre"],
            response: "Nuestra sección de ropa de hombre incluye una gran variedad de camisas, pantalones, chaquetas y accesorios con las últimas tendencias urbanas. ¡Seguro encuentras algo que te guste!"
        },
        {
            keywords: ["ropa de mujer", "moda femenina", "vestidos", "faldas", "tops mujer"],
            response: "Descubre nuestra colección de ropa de mujer con vestidos, faldas, tops y prendas exclusivas que combinan estilo y comodidad para cualquier ocasión."
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

    // Lógica para procesar la entrada del usuario y generar una respuesta del bot
    function processUserInput() {
        const message = userInput.value.trim(); // Obtiene el texto del input y elimina espacios al inicio/final
        if (message === "") return; // Si el mensaje está vacío, no hace nada

        addMessage(message, 'user'); // Añade el mensaje del usuario al chat
        userInput.value = ''; // Limpia el campo de entrada

        // Respuesta por defecto si no se encuentra una coincidencia
        let botResponse = "Lo siento, no tengo una respuesta específica para eso en este momento. ¿Podrías reformular tu pregunta o visitar nuestra sección de Preguntas Frecuentes?"; 

        const lowerCaseMessage = message.toLowerCase(); // Convierte el mensaje a minúsculas para una mejor comparación

        // Busca una coincidencia en la base de conocimientos
        for (const entry of knowledgeBase) {
            // Comprueba si alguna de las palabras clave de la entrada está contenida en el mensaje del usuario
            const foundKeyword = entry.keywords.some(keyword => lowerCaseMessage.includes(keyword));
            if (foundKeyword) {
                botResponse = entry.response; // Asigna la respuesta encontrada
                break; // Sale del bucle una vez que se encuentra una coincidencia
            }
        }

        // Simula un pequeño retraso antes de que el bot responda, para una experiencia más natural
        setTimeout(() => {
            addMessage(botResponse, 'bot');
        }, 500); // Retraso de 500 milisegundos (0.5 segundos)
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
    addMessage("¡Hola! Soy tu asistente virtual en Estilo Urbano. Estoy aquí para ayudarte con cualquier duda sobre nuestros productos, pedidos o envíos. ¿En qué puedo ayudarte hoy?", 'bot');
});
