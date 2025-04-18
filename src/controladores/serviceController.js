// src/controladores/serviceController.js
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const serviceService = require('../servicios/serviceService');
const Service = require('../modelos/Service'); // Necesitamos el modelo aquí

const checkUniqueServiceName = async (name, serviceIdToExclude = null) => {
    if (!name) return;
    const whereCondition = { name: name.trim() };
    if (serviceIdToExclude) {
        whereCondition.id = { [Op.ne]: serviceIdToExclude };
    }
    const existingService = await Service.findOne({ where: whereCondition });
    if (existingService) {
        throw new Error('El nombre del servicio ya está en uso');
    }
};

const createService = async (req, res) => {
  console.log("[Ctrl:createService] Body Recibido:", req.body);
  console.log("[Ctrl:createService] File Recibido:", req.file);

  try {
    await body('nombre')
        .trim()
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres')
        .custom(async (name) => await checkUniqueServiceName(name))
        .run(req);

    await body('descripcion')
         .optional()
         .isString().withMessage('La descripción debe ser texto')
         .run(req);

    await body('precio')
         .optional({ checkFalsy: true })
         .isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo')
         .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("[Ctrl:createService] Errores de Validación:", errors.array());
      return res.status(422).json({ errors: errors.array() });
    }

    const newService = await serviceService.createService(req.body, req.file);
    res.status(201).json(newService);

  } catch (error) {
    console.error("[Ctrl:createService] Error:", error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error interno al crear el servicio.' });
  }
};

const updateService = async (req, res) => {
  const idErrors = validationResult(req); // Captura errores de validación de ID (de la ruta)
  if (!idErrors.isEmpty()) {
      return res.status(422).json({ errors: idErrors.array() });
  }

  const serviceId = req.params.id;
  console.log(`[Ctrl:updateService ID: ${serviceId}] Body Recibido:`, req.body);
  console.log(`[Ctrl:updateService ID: ${serviceId}] File Recibido:`, req.file);

  try {
    await body('nombre')
        .optional()
        .trim()
        .isLength({ min: 3 }).withMessage('Si se proporciona, el nombre debe tener 3+ caracteres')
        .custom(async (name) => await checkUniqueServiceName(name, serviceId))
        .run(req);

    await body('descripcion')
        .optional()
        .isString().withMessage('La descripción debe ser texto')
        .run(req);

    await body('precio')
        .optional({ checkFalsy: true })
        .isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo')
        .run(req);

    const bodyErrors = validationResult(req); // Revisa errores después de validar el body
    // Combinar errores de params y body si es necesario o solo mostrar los del body
    const allErrors = idErrors.isEmpty() ? bodyErrors : validationResult(req);
    if (!allErrors.isEmpty()) {
        console.log(`[Ctrl:updateService ID: ${serviceId}] Errores de Validación:`, allErrors.array());
        return res.status(422).json({ errors: allErrors.array() });
    }

    const updatedService = await serviceService.updateService(serviceId, req.body, req.file);
    res.status(200).json(updatedService);

  } catch (error) {
    console.error(`[Ctrl:updateService ID: ${serviceId}] Error:`, error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error al actualizar el servicio.' });
  }
};


const getAllServices = async (req, res) => {
  try {
    const services = await serviceService.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error en ctrl.getAllServices:", error);
    res.status(500).json({ message: error.message || 'Error al obtener servicios.' });
  }
};

const getServiceById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const service = await serviceService.getServiceById(req.params.id);
    res.status(200).json(service);
  } catch (error) {
    console.error("Error en ctrl.getServiceById:", error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error al obtener el servicio.' });
  }
};

const deleteService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    await serviceService.deleteService(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error("Error en ctrl.deleteService:", error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error al eliminar el servicio.' });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
};