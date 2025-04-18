const { validationResult } = require('express-validator');
const specimenService = require('../servicios/specimenService');

const createSpecimen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const specimen = await specimenService.createSpecimen(req.body);
    res.status(201).json(specimen);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllSpecimens = async (req, res) => {
  try {
    const specimens = await specimenService.getAllSpecimens();
    res.status(200).json(specimens);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSpecimenById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const specimen = await specimenService.getSpecimenById(req.params.id);
    res.status(200).json(specimen);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSpecimen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await specimenService.updateSpecimen(req.params.id, req.body);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSpecimen = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await specimenService.deleteSpecimen(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const moveSpecimen = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { sedeId, specimenCategoryId } = req.body;
        const { id } = req.params;

        await specimenService.moveSpecimen(id, sedeId, specimenCategoryId);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
  createSpecimen,
  getAllSpecimens,
  getSpecimenById,
  updateSpecimen,
  deleteSpecimen,
  moveSpecimen
};