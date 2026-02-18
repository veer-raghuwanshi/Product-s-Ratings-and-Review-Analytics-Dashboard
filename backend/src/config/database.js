const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const toBool = (value) => /^(true|1|yes)$/i.test(String(value || '').trim());
const useSSL = toBool(process.env.DB_SSL);

const buildSslConfig = () => {
  if (!useSSL) return null;

  const ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  };

  if (process.env.DB_SSL_CA_PATH) {
    const caPath = path.resolve(process.cwd(), process.env.DB_SSL_CA_PATH);
    if (!fs.existsSync(caPath)) {
      throw new Error(`DB SSL CA file not found at: ${caPath}`);
    }
    ssl.ca = fs.readFileSync(caPath, 'utf8');
  } else if (process.env.DB_SSL_CA) {
    ssl.ca = process.env.DB_SSL_CA.replace(/\\n/g, '\n');
  }

  return ssl;
};

const sslConfig = buildSslConfig();
const dialectOptions = sslConfig ? { ssl: sslConfig } : {};
const sanitizeDatabaseUrl = (rawUrl) => {
  if (!rawUrl) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    parsed.searchParams.delete('ssl-mode');
    parsed.searchParams.delete('sslmode');
    return parsed.toString();
  } catch {
    return rawUrl;
  }
};
const databaseUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL);
const baseConfig = {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, baseConfig)
  : new Sequelize(
      process.env.DB_NAME || 'product_analytics',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        ...baseConfig,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      }
    );

module.exports = sequelize;
