const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Specimen = require('./Specimen'); 

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    documento: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    celular: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ejemplares: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'clients',
    timestamps: false, 
});

module.exports = Client;