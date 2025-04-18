// src/modelos/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Role = require('./Role'); // Asegúrate que la ruta a Role sea correcta

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // --- NUEVOS CAMPOS ---
    nombreCompleto: { // Corresponde a 'nombres' que mencionaste
        type: DataTypes.STRING,
        allowNull: false, // Asumiendo que es requerido
    },
    documento: { // Corresponde a 'cédula'
        type: DataTypes.STRING,
        allowNull: false, // Asumiendo que es requerido
        unique: true // Generalmente la cédula/documento es única
    },
    email: { // Corresponde a 'correo'
        type: DataTypes.STRING,
        allowNull: false, // Requerido
        unique: true, // El email debe ser único
        validate: {
            isEmail: true // Validación incorporada de Sequelize
        }
    },
    celular: { // Corresponde a 'celular'
        type: DataTypes.STRING,
        allowNull: true // Puede ser opcional, ajusta si es requerido
    },
    // --- FIN NUEVOS CAMPOS ---
    username: { // Corresponde a 'usuario' (login)
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Role,
            key: 'id'
        }
    }
}, {
    // Opciones adicionales del modelo si las necesitas (timestamps, etc.)
    // timestamps: true,
    // paranoid: true, // Si quieres borrado lógico
});

// La asociación ya está definida correctamente en associations.js
// User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

module.exports = User;