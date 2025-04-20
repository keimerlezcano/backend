const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const SpecimenCategory = require('./SpecimenCategory');
const Sede = require('./sede');
const Client = require('./client'); 
const Contract = require('./contract');
const { v4: uuidv4 } = require('uuid');

const Specimen = sequelize.define('Specimen', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    breed: {
        type: DataTypes.STRING,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birthDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    clientId: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        // references: {
        //     model: Client,
        //     key: 'id'
        // }
    },
    specimenCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //     model: SpecimenCategory,
        //     key: 'id'
        // }
    },
    identifier: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true
    },
    sedeId: {
        type: DataTypes.INTEGER,
        allowNull: false, // <-- CAMBIO: Hacerlo obligatorio
        references: {     // <-- RECOMENDADO: Descomentar y asegurar relación a nivel DB
            model: Sede, // O el nombre de la tabla 'Sedes' si no usas el modelo directamente aquí
            key: 'id'
        },
        validate: {        // <-- NUEVO: Añadir validación explícita
             notNull: {
                 msg: 'El ejemplar debe pertenecer a una sede.'
             }
        }
    },

    
    contractId: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        // references: {
        //     model: Contract, 
        //     key: 'id'
        // }
    }
}, {
    timestamps: false
});

// Specimen.associate = (models) => {
//     Specimen.belongsTo(models.Contract, { foreignKey: 'contractId', as: 'contract' });
// };

// Specimen.belongsTo(SpecimenCategory, { foreignKey: 'specimenCategoryId', as: 'category' });
// SpecimenCategory.hasMany(Specimen, { foreignKey: 'specimenCategoryId', as: 'ejemplaresDeCategoria' });

// Specimen.belongsTo(Sede, { foreignKey: 'sedeId', as: 'sede' });
// Sede.hasMany(Specimen, { foreignKey: 'sedeId', as: 'ejemplaresEnSede' });

// Specimen.belongsTo(Client, { foreignKey: 'clientId', as: 'propietario' });
// Client.hasMany(Specimen, { foreignKey: 'clientId', as: 'specimens' });

module.exports = Specimen;
