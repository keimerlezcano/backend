// src/modelos/Service.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate que la ruta sea correcta

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Usa 'nombre' y mapea a la columna 'name' de la DB
  nombre: {
    type: DataTypes.STRING,
    allowNull: false, // Sigue siendo obligatorio
    field: 'name'
  },
  // Usa 'descripcion' y mapea a la columna 'description' de la DB
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description'
  },
  // Añadir solo el campo imagen
  imagen: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_url' 
  }
}, {
    tableName: 'services',
    timestamps: false, // O true si las usas
});

module.exports = Service;