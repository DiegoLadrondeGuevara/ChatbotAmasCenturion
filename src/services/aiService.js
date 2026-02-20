/**
 * Servicio de Inteligencia Artificial — OpenRouter
 * Centraliza todas las llamadas al modelo de IA.
 */

const axios = require('axios');
const env = require('../config/env');

/**
 * System prompt que define la personalidad del asistente.
 * Se puede personalizar según las necesidades de la academia.
 */
const SYSTEM_PROMPT = `Eres el asistente virtual de la Academia de Artes Marciales Amas Centurion.
Tu nombre es Centurion Bot. Eres amable, profesional y entusiasta de las artes marciales.

Tus responsabilidades:
- Informar sobre horarios de clases, disciplinas y profesores.
- Responder preguntas frecuentes sobre la academia.
- Ayudar a los alumnos con información sobre pagos e inscripciones.
- Motivar a los alumnos a seguir entrenando.

Reglas:
- Responde siempre en español.
- Sé conciso pero completo.
- Si no tienes la información, indica amablemente que el alumno debe contactar a la recepción.
- No inventes horarios ni precios; usa solo el contexto proporcionado.
- Usa emojis con moderación para hacer la conversación amigable. 🥋`;

/**
 * Consulta al modelo de IA a través de OpenRouter.
 * @param {string} userMessage — Mensaje del usuario.
 * @param {string} context — Contexto de la academia (horarios, info alumno, etc.).
 * @returns {Promise<string>} — Respuesta generada por la IA.
 */
const askAI = async (userMessage, context = '') => {
    try {
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
        ];

        // Agregar contexto si está disponible
        if (context) {
            messages.push({
                role: 'system',
                content: `Contexto actual de la academia:\n${context}`,
            });
        }

        messages.push({ role: 'user', content: userMessage });

        const response = await axios.post(
            `${env.openrouter.apiUrl}/chat/completions`,
            {
                model: env.openrouter.model,
                messages,
                max_tokens: 500,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${env.openrouter.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://amas-centurion.com',
                    'X-Title': 'Amas Centurion Bot',
                },
                timeout: 30000,
            }
        );

        const reply = response.data?.choices?.[0]?.message?.content;

        if (!reply) {
            console.error('⚠️ OpenRouter respondió sin contenido:', JSON.stringify(response.data));
            return 'Lo siento, no pude procesar tu mensaje. Intenta de nuevo en un momento. 🙏';
        }

        return reply.trim();
    } catch (error) {
        console.error('❌ Error al consultar OpenRouter:', error.response?.data || error.message);
        return 'Estoy teniendo problemas para responder. Por favor intenta de nuevo en unos minutos. 🙏';
    }
};

module.exports = { askAI };
