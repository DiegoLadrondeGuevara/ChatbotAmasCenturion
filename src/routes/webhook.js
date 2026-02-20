/**
 * Rutas de Webhook — Endpoints para YCloud
 */

const express = require('express');
const { handleIncomingMessage } = require('../controllers/chatController');

const router = express.Router();

/**
 * POST /webhook/whatsapp
 * Recibe webhooks de YCloud cuando llega un mensaje o cambio de estado.
 */
router.post('/whatsapp', async (req, res) => {
    const data = req.body;

    // Responder inmediatamente a YCloud para evitar reintentos
    res.sendStatus(200);

    // Procesar solo mensajes recibidos
    if (data.type === 'whatsapp.message.received') {
        try {
            await handleIncomingMessage(data.whatsappMessageReceived);
        } catch (error) {
            console.error('❌ Error procesando webhook:', error.message);
        }
    } else {
        console.log(`📋 Evento de YCloud ignorado: ${data.type || 'desconocido'}`);
    }
});

/**
 * GET /webhook/whatsapp
 * Health check / verificación del endpoint de webhook.
 */
router.get('/whatsapp', (req, res) => {
    res.json({ status: 'ok', service: 'Amas Centurion Bot — Webhook activo' });
});

module.exports = router;
