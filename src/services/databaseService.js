/**
 * Servicio de Base de Datos
 * CRUD para conversaciones y clientes en PostgreSQL.
 */

const { pool } = require('../config/database');
const env = require('../config/env');

/**
 * Guarda una conversación (mensaje + respuesta) en la base de datos.
 * @param {string} phone — Número del cliente.
 * @param {string} message — Mensaje enviado por el cliente.
 * @param {string} response — Respuesta generada por la IA.
 * @returns {Promise<object>} — Registro creado.
 */
const saveConversation = async (phone, message, response) => {
    const result = await pool.query(
        `INSERT INTO conversations (phone, message, response, model, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
        [phone, message, response, env.openrouter.model]
    );
    return result.rows[0];
};

/**
 * Registra un nuevo cliente o actualiza su último contacto.
 * @param {string} phone — Número de teléfono.
 * @returns {Promise<object>} — Datos del cliente.
 */
const getOrCreateClient = async (phone) => {
    // Intentar actualizar si ya existe
    const updateResult = await pool.query(
        `UPDATE clients
     SET last_contact = NOW(), message_count = message_count + 1
     WHERE phone = $1
     RETURNING *`,
        [phone]
    );

    if (updateResult.rows.length > 0) {
        return updateResult.rows[0];
    }

    // Si no existe, crear nuevo
    const insertResult = await pool.query(
        `INSERT INTO clients (phone, first_contact, last_contact, message_count)
     VALUES ($1, NOW(), NOW(), 1)
     RETURNING *`,
        [phone]
    );

    console.log(`🆕 Nuevo cliente registrado: ${phone}`);
    return insertResult.rows[0];
};

/**
 * Obtiene las últimas N conversaciones de un número (para contexto de IA).
 * @param {string} phone — Número del cliente.
 * @param {number} limit — Cantidad de mensajes a obtener (default 5).
 * @returns {Promise<Array>} — Historial reciente.
 */
const getRecentHistory = async (phone, limit = 5) => {
    const result = await pool.query(
        `SELECT message, response, created_at
     FROM conversations
     WHERE phone = $1
     ORDER BY created_at DESC
     LIMIT $2`,
        [phone, limit]
    );
    return result.rows.reverse(); // Orden cronológico
};

module.exports = { saveConversation, getOrCreateClient, getRecentHistory };
