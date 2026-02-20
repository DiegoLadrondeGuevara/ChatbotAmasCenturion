/**
 * Servicio del Backend de la Academia
 * Consulta datos de horarios, alumnos y pagos desde el backend propio.
 */

const axios = require('axios');
const env = require('../config/env');

/**
 * Cliente axios preconfigurado para el backend de la academia.
 */
const backend = axios.create({
    baseURL: env.backend.apiUrl,
    headers: {
        'Content-Type': 'application/json',
        ...(env.backend.apiKey && { Authorization: `Bearer ${env.backend.apiKey}` }),
    },
    timeout: 10000,
});

/**
 * Obtiene los horarios de clases de la academia.
 * @returns {Promise<string>} — Horarios formateados como texto.
 */
const getSchedules = async () => {
    try {
        const response = await backend.get('/schedules');
        const schedules = response.data;

        // Formatea los horarios como texto legible para la IA
        if (Array.isArray(schedules)) {
            return schedules
                .map((s) => `${s.discipline || s.name} — ${s.day || s.days}: ${s.time || s.schedule}`)
                .join('\n');
        }

        return JSON.stringify(schedules);
    } catch (error) {
        console.warn('⚠️ No se pudieron obtener horarios del backend:', error.message);
        return 'Horarios no disponibles en este momento.';
    }
};

/**
 * Busca la información de un alumno por su número de teléfono.
 * @param {string} phone — Número de teléfono del alumno.
 * @returns {Promise<object|null>} — Datos del alumno o null si no se encuentra.
 */
const getStudentInfo = async (phone) => {
    try {
        const response = await backend.get(`/students/phone/${encodeURIComponent(phone)}`);
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null; // Alumno no registrado
        }
        console.warn('⚠️ Error al buscar alumno:', error.message);
        return null;
    }
};

/**
 * Construye el contexto completo de la academia para la IA.
 * Combina horarios e info del alumno en un bloque de texto.
 * @param {string} phone — Número del usuario que escribe.
 * @returns {Promise<string>} — Contexto en texto plano.
 */
const buildContext = async (phone) => {
    const [schedules, student] = await Promise.all([
        getSchedules(),
        getStudentInfo(phone),
    ]);

    let context = `📋 Horarios de clases:\n${schedules}`;

    if (student) {
        context += `\n\n👤 Alumno registrado: ${student.name || 'N/A'}`;
        context += `\n   Disciplina: ${student.discipline || 'N/A'}`;
        context += `\n   Estado de pago: ${student.paymentStatus || 'N/A'}`;
    } else {
        context += '\n\n👤 El usuario no está registrado como alumno.';
    }

    return context;
};

module.exports = { getSchedules, getStudentInfo, buildContext };
