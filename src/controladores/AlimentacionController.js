// src/controladores/AlimentacionController.js
const alimentacionService = require('../servicios/AlimentacionService');
const { validationResult } = require('express-validator');
// Importar tipos de error si planeas manejo específico (opcional aquí, pero buena práctica)
// const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

// --- Controlador para CREAR un registro de Alimentación ---
const createAlimentacion = async (req, res) => {
    // 1. Validar entrada (usando middleware express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // 2. Llamar al servicio para crear
        const nuevoRegistro = await alimentacionService.createAlimentacion(req.body);
        res.status(201).json(nuevoRegistro); // 201 Created
    } catch (error) {
        console.error("Error en controlador al crear alimentación:", error);
        // Podríamos añadir manejo específico para ForeignKeyConstraintError si specimenId no existe
        // if (error instanceof ForeignKeyConstraintError) { ... }

        // Error genérico 500 para otros problemas
        res.status(500).json({ message: 'Error al crear el registro de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

// --- Controlador para OBTENER TODOS los registros de Alimentación ---
const getAllAlimentaciones = async (req, res) => {
    try {
        const alimentaciones = await alimentacionService.getAllAlimentaciones();
        res.status(200).json(alimentaciones); // 200 OK
    } catch (error) {
        console.error("Error en controlador al obtener alimentaciones:", error);
        res.status(500).json({ message: 'Error al obtener los registros de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

// --- Controlador para OBTENER UN registro de Alimentación por ID ---
const getAlimentacionById = async (req, res) => {
    // Validar que el ID es un número (se hará con middleware después)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Manejo error de validación de ID
    }

    try {
        const id = req.params.id;
        const registro = await alimentacionService.getAlimentacionById(id);

        if (!registro) {
            // Si el servicio devuelve null, no se encontró
            return res.status(404).json({ message: 'Registro de alimentación no encontrado' }); // 404 Not Found
        }
        res.status(200).json(registro); // 200 OK
    } catch (error) {
        console.error("Error en controlador al obtener alimentación por ID:", error);
        res.status(500).json({ message: 'Error al obtener el registro de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

// --- Controlador para ACTUALIZAR un registro de Alimentación por ID ---
const updateAlimentacion = async (req, res) => {
    // 1. Validar ID y Body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id = req.params.id;
        // 2. Llamar al servicio para actualizar
        const registroActualizado = await alimentacionService.updateAlimentacion(id, req.body);

        if (!registroActualizado) {
            // Si el servicio devuelve null, no se encontró para actualizar
            return res.status(404).json({ message: 'Registro de alimentación no encontrado' }); // 404 Not Found
        }
        res.status(200).json(registroActualizado); // 200 OK
    } catch (error) {
        console.error("Error en controlador al actualizar alimentación:", error);
         // Podríamos añadir manejo específico para ForeignKeyConstraintError si specimenId no existe
        res.status(500).json({ message: 'Error al actualizar el registro de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

// --- Controlador para ELIMINAR un registro de Alimentación por ID ---
const deleteAlimentacion = async (req, res) => {
    // Validar ID
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const id = req.params.id;
        // 2. Llamar al servicio para eliminar
        const fueEliminado = await alimentacionService.deleteAlimentacion(id);

        if (!fueEliminado) {
            // Si el servicio devuelve false, no se encontró para eliminar
            return res.status(404).json({ message: 'Registro de alimentación no encontrado' }); // 404 Not Found
        }
        res.status(204).send(); // 204 No Content (respuesta estándar para DELETE exitoso)
    } catch (error) {
        console.error("Error en controlador al eliminar alimentación:", error);
        res.status(500).json({ message: 'Error al eliminar el registro de alimentación', error: 'Ocurrió un error interno en el servidor.' });
    }
};

module.exports = {
    createAlimentacion,
    getAllAlimentaciones,
    getAlimentacionById,
    updateAlimentacion,
    deleteAlimentacion
};