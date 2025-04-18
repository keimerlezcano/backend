// src/repositorios/specimenRepository.js
const { Op } = require('sequelize');
const Specimen = require('../modelos/Specimen');
const SpecimenCategory = require('../modelos/SpecimenCategory');
const Sede = require('../modelos/sede');
const Client = require('../modelos/client');
const Contract = require('../modelos/contract'); // Asume que el archivo es Contract.js (C mayúscula)

console.log('[SpecimenRepo] Módulo cargado.');
console.log('[SpecimenRepo] Modelo Contract cargado:', typeof Contract === 'function' || typeof Contract === 'object' ? 'OK' : 'ERROR - Verifica Importación/Archivo');

const createSpecimen = async (specimenData) => {
    console.log("[SpecimenRepo:createSpecimen] Datos:", specimenData);
    try {
        const newSpecimen = await Specimen.create(specimenData);
        console.log("[SpecimenRepo:createSpecimen] ID Creado:", newSpecimen.id);
        return newSpecimen;
    } catch (error) {
        console.error("[SpecimenRepo:createSpecimen] Error:", error);
        throw error;
    }
};

const getAllSpecimens = async () => {
    console.log("[SpecimenRepo:getAllSpecimens] Buscando todos...");
    try {
        const includes = [
            { model: SpecimenCategory, as: 'category', attributes: [ 'name'] }, // <-- Sin cambios
            { model: Sede, as: 'sede', attributes: ['NombreSede'] }, // <-- Sin cambios
            { model: Client, as: 'propietario', attributes: ['id', 'nombre', 'documento', 'correo', 'celular' ]}, // <-- Sin cambios
            {
                model: Contract,
                as: 'contract',
                required: false,
                attributes: [
                    'id',
                    'fechaInicio',
                    'precioMensual' // <--- ÚNICA CORRECCIÓN AÑADIDA AQUÍ
                ]
            }
        ];
        const specimens = await Specimen.findAll({ include: includes, order: [['id', 'ASC']] });
        console.log(`[SpecimenRepo:getAllSpecimens] Encontrados: ${specimens.length}`);
        return specimens;
    } catch (error) {
        console.error("[SpecimenRepo:getAllSpecimens] Error:", error);
         if (error.parent && error.parent.sql) console.error("[SpecimenRepo] SQL Error:", error.parent.sql);
         else console.log("[SpecimenRepo] No se pudo obtener SQL del error.");
        throw error; // Relanza el error
    }
};

const getSpecimenById = async (id) => {
     console.log(`[SpecimenRepo:getSpecimenById] Buscando ID: ${id}`);
     try {
         const specimenId = parseInt(id, 10);
         if (isNaN(specimenId)) return null;
         const includes = [ // <-- Mantenemos la misma estructura que en la versión original
            { model: SpecimenCategory, as: 'category', attributes: ['name'] },
            { model: Sede, as: 'sede', attributes: ['NombreSede'] },
            { model: Client, as: 'propietario', attributes: ['id', 'nombre', 'documento', 'correo', 'celular'] },
            {
                model: Contract,
                as: 'contract',
                required: false,
                attributes: [ // <-- Añadimos precioMensual aquí también por consistencia, aunque no se use directamente en el flujo original del error
                   'id',
                   'fechaInicio',
                   'precioMensual'
                ]
            }
         ];
         const specimen = await Specimen.findByPk(specimenId, { include: includes });
         console.log(`[SpecimenRepo:getSpecimenById] Encontrado para ID ${id}:`, !!specimen);
         return specimen;
     } catch (error) {
        console.error(`[SpecimenRepo:getSpecimenById] Error ID ${id}:`, error);
        throw error;
     }
};

const updateSpecimen = async (id, specimenData) => {
    console.log(`[SpecimenRepo:updateSpecimen] ID: ${id}, Datos:`, specimenData);
    try {
        const specimenId = parseInt(id, 10);
        if (isNaN(specimenId)) throw new Error(`ID inválido para actualizar: ${id}`);
        const validData = {};
        Object.keys(specimenData).forEach(key => {
            // Permite actualizar a null explícitamente si viene en los datos
            if (specimenData[key] !== undefined && key !== 'id') validData[key] = specimenData[key];
        });
        if (Object.keys(validData).length === 0) {
             console.log(`[SpecimenRepo:updateSpecimen ID ${id}] Sin datos válidos para actualizar.`);
             return [0];
        }
        const result = await Specimen.update(validData, { where: { id: specimenId } });
        console.log(`[SpecimenRepo:updateSpecimen ID ${id}] Filas afectadas:`, result[0]);
        return result;
    } catch (error) {
        console.error(`[SpecimenRepo:updateSpecimen ID ${id}] Error:`, error);
        throw error;
    }
};

const deleteSpecimen = async (id) => {
     console.log(`[SpecimenRepo:deleteSpecimen] ID: ${id}`);
     try {
        const specimenId = parseInt(id, 10);
        if (isNaN(specimenId)) throw new Error(`ID inválido para eliminar: ${id}`);
        const deletedRows = await Specimen.destroy({ where: { id: specimenId } });
        console.log(`[SpecimenRepo:deleteSpecimen ID ${id}] Filas eliminadas:`, deletedRows);
        return deletedRows;
     } catch (error) {
        console.error(`[SpecimenRepo:deleteSpecimen ID ${id}] Error:`, error);
        throw error;
     }
};

// Esta función es conceptualmente igual a update, la mantenemos por claridad si quieres
const moveSpecimen = async (id, moveData) => {
     console.log(`[SpecimenRepo:moveSpecimen ID ${id}] Datos:`, moveData);
     const validMoveData = {};
     if (moveData.hasOwnProperty('specimenCategoryId')) validMoveData.specimenCategoryId = moveData.specimenCategoryId ? parseInt(moveData.specimenCategoryId, 10) : null;
     if (moveData.hasOwnProperty('sedeId')) validMoveData.sedeId = moveData.sedeId ? parseInt(moveData.sedeId, 10) : null;
     if (moveData.hasOwnProperty('clientId')) validMoveData.clientId = moveData.clientId ? parseInt(moveData.clientId, 10) : null;

     if (Object.keys(validMoveData).length === 0) {
         console.log(`[SpecimenRepo:moveSpecimen ID ${id}] Sin datos válidos para mover.`);
         return [0];
     }
     return updateSpecimen(id, validMoveData); // Reutiliza update
};

module.exports = {
    createSpecimen,
    getAllSpecimens,
    getSpecimenById,
    updateSpecimen,
    deleteSpecimen,
    moveSpecimen // Mantenemos exportación aunque use update internamente
};