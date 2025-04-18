const specimenCategoryRepository = require('../repositorios/specimenCategoryRepository');

const createSpecimenCategory = async (specimenCategory) => {
  return specimenCategoryRepository.createSpecimenCategory(specimenCategory);
};

const getAllSpecimenCategories = async () => {
  return specimenCategoryRepository.getAllSpecimenCategories();
};

const getSpecimenCategoryById = async (id) => {
  return specimenCategoryRepository.getSpecimenCategoryById(id);
};

const updateSpecimenCategory = async (id, specimenCategory) => {
  return specimenCategoryRepository.updateSpecimenCategory(id, specimenCategory);
};

const deleteSpecimenCategory = async (id) => {
  return specimenCategoryRepository.deleteSpecimenCategory(id);
};

module.exports = {
  createSpecimenCategory,
  getAllSpecimenCategories,
  getSpecimenCategoryById,
  updateSpecimenCategory,
  deleteSpecimenCategory
};