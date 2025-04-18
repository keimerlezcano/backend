const { validationResult } = require('express-validator');
const specimenCategoryService = require('../servicios/specimenCategoryService');

const createSpecimenCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const specimenCategory = await specimenCategoryService.createSpecimenCategory(req.body);
    res.status(201).json(specimenCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllSpecimenCategories = async (req, res) => {
  try {
    const specimenCategories = await specimenCategoryService.getAllSpecimenCategories();
    res.status(200).json(specimenCategories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSpecimenCategoryById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const specimenCategory = await specimenCategoryService.getSpecimenCategoryById(req.params.id);
    res.status(200).json(specimenCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSpecimenCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await specimenCategoryService.updateSpecimenCategory(req.params.id, req.body);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSpecimenCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await specimenCategoryService.deleteSpecimenCategory(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSpecimenCategory,
  getAllSpecimenCategories,
  getSpecimenCategoryById,
  updateSpecimenCategory,
  deleteSpecimenCategory
};