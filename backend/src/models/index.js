const sequelize = require('../config/database');
const Product = require('./Product');

const syncDB = async () => {
  // alter: true safely updates schema without dropping data
  await sequelize.sync({ alter: true });
  console.log('Database synced successfully');
};

module.exports = { sequelize, syncDB, Product };
