// src/controladores/medicineController.js
const medicineService = require('../servicios/medicineService');
const { validationResult } = require('express-validator');
const { UniqueConstraintError } = require('sequelize'); // Asegúrate que esta línea esté

const createMedicine = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const medicine = await medicineService.createMedicine(req.body);
        res.status(201).json(medicine);
    } catch (error) {
        console.error("Error creating medicine:", error); // Mantén el log detallado

        // Verifica si el error es de restricción única
        if (error instanceof UniqueConstraintError) {
            // Código 409 Conflict es apropiado para duplicados
            return res.status(409).json({
                message: 'Error al crear la medicina',
                error: 'Ya existe una medicina con este nombre para el espécimen especificado.',
                // Opcional: puedes intentar extraer los campos en conflicto de error.fields si quieres
                // fields: error.fields
            });
        }

        // Para cualquier otro error inesperado, devuelve un error 500 genérico
        res.status(500).json({
             message: 'Error creating medicine',
             // Mensaje genérico para errores 500
             error: 'Ocurrió un error interno en el servidor.'
        });
    }
};

const getAllMedicines = async (req, res) => {
    try {
        const medicines = await medicineService.getAllMedicines();
        res.status(200).json(medicines);
    } catch (error) {
        console.error("Error getting all medicines:", error);
        res.status(500).json({ message: 'Error fetching medicines', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const getMedicineById = async (req, res) => {
    try {
        const medicine = await medicineService.getMedicineById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.status(200).json(medicine);
    } catch (error) {
        console.error("Error getting medicine by ID:", error);
        res.status(500).json({ message: 'Error fetching medicine', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const updateMedicine = async (req, res) => {
    // Similar al create, podrías añadir manejo específico para UniqueConstraintError aquí también si la actualización pudiera causarlo
    try {
        const medicineId = req.params.id;
        console.log("Updating medicine with ID:", medicineId);
        const medicine = await medicineService.updateMedicine(medicineId, req.body);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.status(200).json(medicine);
    } catch (error) {
        console.error("Error updating medicine:", error);

        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({
                message: 'Error al actualizar la medicina',
                error: 'Ya existe otra medicina con este nombre para el espécimen especificado.',
            });
        }

        res.status(500).json({ message: 'Error updating medicine', error: 'Ocurrió un error interno en el servidor.' });
    }
};

const deleteMedicine = async (req, res) => {
    try {
        const result = await medicineService.deleteMedicine(req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.status(204).send(); // No content on successful deletion
    } catch (error) {
        console.error("Error deleting medicine:", error);
        res.status(500).json({ message: 'Error deleting medicine', error: 'Ocurrió un error interno en el servidor.' });
    }
};

module.exports = {
    createMedicine,
    getAllMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine
};