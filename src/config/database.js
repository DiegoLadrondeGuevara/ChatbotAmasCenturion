/**
 * Configuración de Base de Datos — PostgreSQL
 * Pool de conexiones y creación automática de tablas.
 */

const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
    connectionString: env.database.url,
    // Config del pool
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Log de conexiones en desarrollo
pool.on('error', (err) => {
    console.error('❌ Error inesperado en pool de PostgreSQL:', err.message);
});

/**
 * Crea las tablas si no existen.
 * Se ejecuta al arrancar el servidor.
 */
const initDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255),
        first_contact TIMESTAMPTZ DEFAULT NOW(),
        last_contact TIMESTAMPTZ DEFAULT NOW(),
        message_count INTEGER DEFAULT 1
      );
    `);

        await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        response TEXT,
        model VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

        // Índices para búsquedas frecuentes
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_phone ON conversations(phone);
      CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
    `);

        console.log('✅ Base de datos inicializada (tablas verificadas)');
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { pool, initDatabase };
