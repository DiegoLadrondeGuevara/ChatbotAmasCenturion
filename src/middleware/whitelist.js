/**
 * Middleware de Whitelist
 * Filtra números que el bot debe IGNORAR (no responder).
 */

const env = require('../config/env');

/**
 * Verifica si un número está en la whitelist (números ignorados).
 * @param {string} phone — Número de teléfono a verificar.
 * @returns {boolean} — true si el número debe ser ignorado.
 */
const isWhitelisted = (phone) => {
    if (!phone || env.whitelist.length === 0) {
        return false;
    }

    // Normalizar: remover +, espacios, guiones
    const normalized = phone.replace(/[\s\-\+]/g, '');

    return env.whitelist.some((whiteNum) => {
        const normalizedWhite = whiteNum.replace(/[\s\-\+]/g, '');
        return normalized.endsWith(normalizedWhite) || normalizedWhite.endsWith(normalized);
    });
};

module.exports = { isWhitelisted };
