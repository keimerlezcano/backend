// src/modelos/Specimen.js
const { Model, DataTypes } = require('sequelize');
// Ya no se requieren otros modelos aquí arriba
// const { v4: uuidv4 } = require('uuid'); // Ya no es necesario si usas DataTypes.UUIDV4

module.exports = (sequelize) => {
  class Specimen extends Model {
    static associate(models) {
      // Un Ejemplar pertenece a una Sede
      Specimen.belongsTo(models.Sede, {
        foreignKey: 'sedeId',
        as: 'sede' // Alias para acceder a la sede desde un ejemplar
      });
      // Un Ejemplar pertenece a una Categoría
      Specimen.belongsTo(models.SpecimenCategory, {
        foreignKey: 'specimenCategoryId',
        as: 'category'
      });
      // Un Ejemplar pertenece a un Cliente
      Specimen.belongsTo(models.Client, {
        foreignKey: 'clientId',
        as: 'client' // O 'propietario' si prefieres
      });
      // Un Ejemplar puede pertenecer a un Contrato
      Specimen.belongsTo(models.Contract, {
        foreignKey: 'contractId',
        as: 'contract'
      });
      // Si tienes modelos como Vacunacion, Alimentacion que pertenecen a Specimen:
      // Specimen.hasMany(models.Vacunacion, { foreignKey: 'specimenId', as: 'vacunaciones' });
      // Specimen.hasMany(models.Alimentacion, { foreignKey: 'specimenId', as: 'alimentaciones' });
    }
  }

  Specimen.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    breed: DataTypes.STRING,
    color: DataTypes.STRING,
    birthDate: DataTypes.DATE,
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permite ejemplares sin cliente asignado?
      references: { model: 'Clients', key: 'id' } // Referencia por nombre de tabla
    },
    specimenCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false, // ¿Todo ejemplar DEBE tener categoría?
      references: { model: 'SpecimenCategories', key: 'id' }
    },
    identifier: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Usar el tipo directamente
      allowNull: false,
      unique: true
    },
    sedeId: { // La clave foránea que lo relaciona con Sede
      type: DataTypes.INTEGER,
      allowNull: true, // ¿Puede un ejemplar no estar asignado a una sede?
      references: { model: 'Sedes', key: 'id' } // Referencia a la tabla Sedes
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ¿Puede un ejemplar no estar asociado a un contrato?
      references: { model: 'Contracts', key: 'id' }
    }
  }, {
    sequelize,
    modelName: 'Specimen',
    // tableName: 'Specimens' // Sequelize infiere esto generalmente
    timestamps: true // <-- ¡AÑADIDO! Asumo que también los usas aquí. Ajusta si no.
  });

  return Specimen;
};