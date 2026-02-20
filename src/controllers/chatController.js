/**
 * Controlador del Chat — Orquestador principal
 * Recibe mensajes de WhatsApp, filtra whitelist, consulta contexto,
 * pide respuesta a la IA, guarda en DB y responde.
 */

const { askAI } = require('../services/aiService');
const { sendMessage } = require('../services/whatsappService');
const { buildContext } = require('../services/backendService');
const { isWhitelisted } = require('../middleware/whitelist');
const { saveConversation, getOrCreateClient } = require('../services/databaseService');

/**
 * Maneja un mensaje entrante de WhatsApp recibido vía webhook de YCloud.
 * @param {object} messageData — Datos del mensaje de YCloud (whatsappMessageReceived).
 */
const handleIncomingMessage = async (messageData) => {
    const { from, body } = messageData;

    // Ignorar mensajes vacíos o de estado
    if (!from || !body) {
        console.log('⏭️ Mensaje ignorado (sin remitente o cuerpo)');
        return;
    }

    // Verificar whitelist — si el número está en la lista, NO responder
    if (isWhitelisted(from)) {
        console.log(`🚫 Mensaje de ${from} ignorado (whitelist)`);
        return;
    }

    console.log(`📩 Mensaje de ${from}: ${body}`);

    try {
        // 1. Registrar/actualizar cliente en la base de datos
        await getOrCreateClient(from);

        // 2. Obtener contexto de la academia (horarios, info alumno)
        const context = await buildContext(from);

        // 3. Consultar a la IA con el contexto
        const aiResponse = await askAI(body, context);

        // 4. Guardar la conversación en PostgreSQL
        await saveConversation(from, body, aiResponse);

        // 5. Enviar la respuesta al usuario
        await sendMessage(from, aiResponse);

        console.log(`📤 Respuesta enviada a ${from}: ${aiResponse.substring(0, 80)}...`);
    } catch (error) {
        console.error(`❌ Error al procesar mensaje de ${from}:`, error.message);

        // Intentar enviar un mensaje de error al usuario
        try {
            await sendMessage(from, 'Disculpa, estoy teniendo dificultades técnicas. Intenta de nuevo en unos minutos. 🙏');
        } catch (sendError) {
            console.error('❌ No se pudo enviar mensaje de error:', sendError.message);
        }
    }
};

module.exports = { handleIncomingMessage };
