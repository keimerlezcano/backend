// src/servicios/medicineService.js
const medicineRepository = require('../repositorios/medicineRepository');

const createMedicine = async (medicineData) => {
    return medicineRepository.createMedicine(medicineData);
};

const getAllMedicines = async () => {
    return medicineRepository.getAllMedicines();
};

const getMedicineById = async (id) => {
    return medicineRepository.getMedicineById(id);
};

const updateMedicine = async (id, medicineData) => {
    return medicineRepository.updateMedicine(id, medicineData);
};

const deleteMedicine = async (id) => {
    return medicineRepository.deleteMedicine(id);
};

module.exports = {
    createMedicine,
    getAllMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine
};