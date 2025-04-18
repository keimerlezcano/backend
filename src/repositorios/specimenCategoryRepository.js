const SpecimenCategory = require('../modelos/SpecimenCategory');

const createSpecimenCategory = async (specimenCategory) => {
  return SpecimenCategory.create(specimenCategory);
};

const getAllSpecimenCategories = async () => {
  return SpecimenCategory.findAll();
};

const getSpecimenCategoryById = async (id) => {
  return SpecimenCategory.findByPk(id);
};

const updateSpecimenCategory = async (id, specimenCategory) => {
  return SpecimenCategory.update(specimenCategory, { where: { id } });
};

const deleteSpecimenCategory = async (id) => {
  return SpecimenCategory.destroy({ where: { id } });
};

module.exports = {
  createSpecimenCategory,
  getAllSpecimenCategories,
  getSpecimenCategoryById,
  updateSpecimenCategory,
  deleteSpecimenCategory
};