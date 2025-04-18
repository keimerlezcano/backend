// src/servicios/VacunacionService.js
const vacunacionRepository = require('../repositorios/VacunacionRepository');

// Llama al repositorio para crear un registro de vacunación
const createVacunacion = async (vacunacionData) => {
  try {
    // Aquí podría ir lógica de negocio antes de guardar
    const nuevoRegistro = await vacunacionRepository.createVacunacion(vacunacionData);
    return nuevoRegistro;
  } catch (error) {
    throw error; // Re-lanzar para el controlador
  }
};

// Llama al repositorio para obtener todos los registros
const getAllVacunaciones = async () => {
  try {
    return await vacunacionRepository.getAllVacunaciones();
  } catch (error) {
    throw error;
  }
};

// Llama al repositorio para obtener un registro por ID
const getVacunacionById = async (id) => {
  try {
    return await vacunacionRepository.getVacunacionById(id);
  } catch (error) {
    throw error;
  }
};

// Llama al repositorio para actualizar un registro
const updateVacunacion = async (id, vacunacionData) => {
  try {
    // Aquí podría ir lógica de negocio antes de actualizar
    return await vacunacionRepository.updateVacunacion(id, vacunacionData);
  } catch (error) {
    throw error;
  }
};

// Llama al repositorio para eliminar un registro
const deleteVacunacion = async (id) => {
  try {
    return await vacunacionRepository.deleteVacunacion(id);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createVacunacion,
  getAllVacunaciones,
  getVacunacionById,
  updateVacunacion,
  deleteVacunacion
};