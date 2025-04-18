// src/servicios/AlimentacionService.js
const alimentacionRepository = require('../repositorios/AlimentacionRepository');

// Llama al repositorio para crear un registro
const createAlimentacion = async (alimentacionData) => {
  try {
    // Aquí podrías añadir lógica de negocio antes de crear, si fuera necesario
    const nuevoRegistro = await alimentacionRepository.createAlimentacion(alimentacionData);
    return nuevoRegistro;
  } catch (error) {
    // Podrías manejar/transformar errores específicos aquí si quisieras
    throw error; // Re-lanzar para que el controlador lo maneje
  }
};

// Llama al repositorio para obtener todos los registros
const getAllAlimentaciones = async () => {
  try {
    return await alimentacionRepository.getAllAlimentaciones();
  } catch (error) {
    throw error;
  }
};

// Llama al repositorio para obtener un registro por ID
const getAlimentacionById = async (id) => {
  try {
    return await alimentacionRepository.getAlimentacionById(id);
  } catch (error) {
    throw error;
  }
};

// Llama al repositorio para actualizar un registro
const updateAlimentacion = async (id, alimentacionData) => {
  try {
    // Aquí podrías añadir lógica de negocio antes de actualizar
    return await alimentacionRepository.updateAlimentacion(id, alimentacionData);
  } catch (error) {
    throw error;
  }
};

// Llama al repositorio para eliminar un registro
const deleteAlimentacion = async (id) => {
  try {
    return await alimentacionRepository.deleteAlimentacion(id);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createAlimentacion,
  getAllAlimentaciones,
  getAlimentacionById,
  updateAlimentacion,
  deleteAlimentacion
};