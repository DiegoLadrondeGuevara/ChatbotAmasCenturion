/**
 * Amas Centurion Bot — Entrada principal
 * Servidor Express que recibe webhooks de YCloud y orquesta respuestas con IA.
 */

const express = require('express');
const env = require('./config/env');
const { initDatabase } = require('./config/database');
const webhookRoutes = require('./routes/webhook');

const app = express();

// --- Middleware ---
app.use(express.json());

// Logging básico de requests (solo en desarrollo)
if (env.isDev) {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// --- Rutas ---
app.use('/webhook', webhookRoutes);

// Health check raíz
app.get('/', (req, res) => {
    res.json({
        service: 'Amas Centurion Bot',
        status: 'running',
        environment: env.nodeEnv,
        model: env.openrouter.model,
    });
});

// --- Manejo de errores global ---
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// --- Arranque ---
const start = async () => {
    try {
        // Inicializar base de datos (crear tablas si no existen)
        await initDatabase();

        app.listen(env.port, () => {
            console.log(`\n🥋 Amas Centurion Bot operando en puerto ${env.port}`);
            console.log(`   Entorno: ${env.nodeEnv}`);
            console.log(`   Modelo IA: ${env.openrouter.model}`);
            console.log(`   Whitelist: ${env.whitelist.length} números ignorados`);
            console.log(`   Webhook: http://localhost:${env.port}/webhook/whatsapp\n`);
        });
    } catch (error) {
        console.error('❌ Error al arrancar el servidor:', error.message);
        process.exit(1);
    }
};

start();
