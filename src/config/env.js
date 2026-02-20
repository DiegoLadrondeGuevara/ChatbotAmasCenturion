/**
 * Configuración centralizada del entorno.
 * Carga .env una sola vez y exporta todas las variables agrupadas por servicio.
 * Valida que las variables críticas existen al arrancar.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Variables requeridas — el servidor no arranca si alguna falta
const REQUIRED_VARS = [
    'YCLOUD_API_KEY',
    'YCLOUD_WHATSAPP_NUMBER',
    'OPENROUTER_API_KEY',
    'DATABASE_URL',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`❌ Variables de entorno faltantes: ${missing.join(', ')}`);
    console.error('   Revisa tu archivo .env');
    process.exit(1);
}

/**
 * Parsea la lista de números de la whitelist desde el .env.
 * Limpia espacios y filtra entradas vacías.
 */
const parseWhitelist = () => {
    const raw = process.env.WHITELIST_NUMBERS || '';
    return raw
        .split(',')
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
};

const env = {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') === 'development',

    ycloud: {
        apiKey: process.env.YCLOUD_API_KEY,
        apiUrl: process.env.YCLOUD_API_URL || 'https://api.ycloud.com/v2',
        whatsappNumber: process.env.YCLOUD_WHATSAPP_NUMBER,
        phoneNumberId: process.env.YCLOUD_PHONE_NUMBER_ID || '',
    },

    openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY,
        apiUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
        model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
    },

    // Números que el bot NO responde
    whitelist: parseWhitelist(),

    database: {
        url: process.env.DATABASE_URL,
    },

    backend: {
        apiUrl: process.env.BACKEND_API_URL || 'http://localhost:4000/api',
        apiKey: process.env.BACKEND_API_KEY || '',
    },
};

module.exports = env;
