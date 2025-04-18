const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SpecimenCategory = sequelize.define('SpecimenCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    allowNull: false,
    defaultValue: 'activo'
  }
}, {
  timestamps: false 
});

module.exports = SpecimenCategory;