// src/controladores/roleController.js
const { validationResult } = require('express-validator');
const roleService = require('../servicios/roleService'); // Importa el servicio

// Controlador para crear un rol
const createRole = async (req, res) => {
  // 1. Validación de express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Devuelve errores de validación si existen
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // 2. Extrae datos del cuerpo (espera 'name' y 'permissions' - array de nombres)
    const { name, permissions } = req.body;
    // 3. Llama al servicio pasando los nombres de permisos
    const newRole = await roleService.createRole(name, permissions);
    // 4. Devuelve el rol creado (que ya incluye permisos formateados)
    res.status(201).json(newRole);
  } catch (error) {
    // 5. Maneja errores del servicio
    console.error("Error en roleController.createRole:", error);
    // Envía 400 si es un error conocido, 500 si es inesperado
    res.status(error.statusCode || 400).json({ message: error.message || 'Error al crear el rol.' });
  }
};

// Controlador para obtener todos los roles
const getAllRoles = async (req, res) => {
  try {
    // Llama al servicio que ya devuelve roles con permisos formateados
    const roles = await roleService.getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error en roleController.getAllRoles:", error);
    res.status(500).json({ message: error.message || 'Error al obtener los roles.' });
  }
};

// Controlador para obtener un rol por ID
const getRoleById = async (req, res) => {
  // Validación de ID (ya hecha en la ruta por getRoleByIdValidation)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Llama al servicio que devuelve el rol con permisos formateados
    const role = await roleService.getRoleById(req.params.id);
    // El servicio ya lanza error 404 si no se encuentra
    res.status(200).json(role);
  } catch (error) {
    console.error("Error en roleController.getRoleById:", error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error al obtener el rol.' });
  }
};

// Controlador para actualizar un rol
const updateRole = async (req, res) => {
  // Validación de express-validator (ID y body)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
     // 1. Extrae datos (espera 'name' y/o 'permissions' - array de nombres)
    const { name, permissions } = req.body;
    const roleId = req.params.id;
    // 2. Llama al servicio pasando los datos a actualizar
    const updatedRole = await roleService.updateRole(roleId, { name, permissions });
    // 3. Devuelve el rol actualizado (con permisos formateados)
    res.status(200).json(updatedRole);
  } catch (error) {
    console.error("Error en roleController.updateRole:", error);
    // Maneja errores (ej. 404 si no se encontró)
    res.status(error.statusCode || 400).json({ message: error.message || 'Error al actualizar el rol.' });
  }
};

// Controlador para eliminar un rol
const deleteRole = async (req, res) => {
  // Validación de ID
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const roleId = req.params.id;
    await roleService.deleteRole(roleId);
    // Si tiene éxito, envía respuesta 204 No Content
    res.status(204).end();
  } catch (error) {
    console.error("Error en roleController.deleteRole:", error);
    // Maneja errores (ej. 404 si no se encontró)
    res.status(error.statusCode || 400).json({ message: error.message || 'Error al eliminar el rol.' });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
};