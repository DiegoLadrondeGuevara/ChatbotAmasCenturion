/**
 * Servicio de WhatsApp — YCloud
 * Envía mensajes a través de la API REST de YCloud.
 */

const axios = require('axios');
const env = require('../config/env');

/**
 * Crea una instancia de axios preconfigurada para YCloud.
 */
const ycloud = axios.create({
    baseURL: env.ycloud.apiUrl,
    headers: {
        'X-API-Key': env.ycloud.apiKey,
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

/**
 * Envía un mensaje de texto por WhatsApp.
 * @param {string} to — Número del destinatario (formato internacional, ej: +5215512345678).
 * @param {string} text — Contenido del mensaje.
 * @returns {Promise<object>} — Respuesta de la API de YCloud.
 */
const sendMessage = async (to, text) => {
    try {
        const response = await ycloud.post('/whatsapp/messages', {
            from: env.ycloud.whatsappNumber,
            to,
            type: 'text',
            text: { body: text },
        });

        console.log(`✅ Mensaje enviado a ${to}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error al enviar mensaje a ${to}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Envía un template de WhatsApp pre-aprobado.
 * @param {string} to — Número del destinatario.
 * @param {string} templateName — Nombre del template registrado en YCloud.
 * @param {Array} params — Parámetros del template.
 * @returns {Promise<object>} — Respuesta de la API de YCloud.
 */
const sendTemplate = async (to, templateName, params = []) => {
    try {
        const components = params.length > 0
            ? [{
                type: 'body',
                parameters: params.map((value) => ({ type: 'text', text: String(value) })),
            }]
            : [];

        const response = await ycloud.post('/whatsapp/messages', {
            from: env.ycloud.whatsappNumber,
            to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: 'es' },
                components,
            },
        });

        console.log(`✅ Template "${templateName}" enviado a ${to}`);
        return response.data;
    } catch (error) {
        console.error(`❌ Error al enviar template a ${to}:`, error.response?.data || error.message);
        throw error;
    }
};

module.exports = { sendMessage, sendTemplate };
