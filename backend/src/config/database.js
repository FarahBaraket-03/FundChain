import { Sequelize } from 'sequelize';


import dotenv from 'dotenv';

dotenv.config();



const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);


// Create a wrapper function for define
export const define = (modelName, attributes, options) => {
  return sequelize.define(modelName, attributes, options);
};

// Test connection
sequelize.authenticate()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection failed:', err));

export default sequelize;