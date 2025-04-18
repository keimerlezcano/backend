// src/modelos/Sede.js
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Sede extends Model {
    static associate(models) {
      // Una Sede tiene muchos Ejemplares
      Sede.hasMany(models.Specimen, {
        foreignKey: 'sedeId', // La clave foránea en la tabla Specimen
        as: 'specimens' // <<< ESTE ALIAS ES IMPORTANTE para el 'include'
      });
    }

    // Validación única personalizada (un poco más robusta)
    static async validateUniqueName(value, options) {
      const queryOptions = { where: { NombreSede: value } };
      // Si estamos actualizando (options.instance existe), excluimos el registro actual
      if (options.instance && options.instance.id) {
        const { Op } = require('sequelize'); // Importar Op aquí si es necesario
        queryOptions.where.id = { [Op.ne]: options.instance.id };
      }
      const existingSede = await Sede.findOne(queryOptions);
      if (existingSede) {
        throw new Error('Ya existe una sede con este nombre.');
      }
    }
  }

  Sede.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Mantendremos 'NombreSede' si así está en tu BD, pero 'name' sería más convencional
    NombreSede: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Mantenemos unique constraint a nivel DB por si acaso
      validate: {
        // Usar la función estática para validación única a nivel de aplicación
        isUnique: Sede.validateUniqueName,
        len: {
          args: [3, 255], // Añadir un máximo también es buena idea
          msg: 'El nombre de la sede debe tener entre 3 y 255 caracteres.'
        }
      }
    },
    // --- AÑADE AQUÍ OTRAS COLUMNAS SI LAS TIENES ---
    // Ejemplo: address: { type: DataTypes.STRING },
    // Ejemplo: city: { type: DataTypes.STRING },
    // Ejemplo: phone: { type: DataTypes.STRING },
    // ----------------------------------------------
  }, {
    sequelize,
    modelName: 'Sede',
    tableName: 'Sedes', // Asegúrate que coincida con tu tabla
    timestamps: true // <-- ¡AÑADIDO! Parece que sí usas timestamps (createdAt/updatedAt)
                     // basado en los INSERTs anteriores. Ajusta si no es así.
  });

  return Sede;
};