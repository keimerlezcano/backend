// src/controladores/userController.js
const { validationResult } = require('express-validator');
const userService = require('../servicios/userService'); // Importar todos los servicios
// const Role = require('../modelos/Role'); // No es necesario aquí si el servicio maneja la lógica

/**
 * Controlador para crear un nuevo usuario.
 */
const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Devuelve un array de mensajes de error para mejor manejo en frontend
        return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }

    try {
        // Extraer TODOS los campos del body
        const { nombreCompleto, documento, email, celular, username, password, roleId } = req.body;
        // Pasar el objeto completo al servicio
        const user = await userService.createUser({
            nombreCompleto, documento, email, celular, username, password, roleId
        });
        // Devolver el usuario creado (sin contraseña)
        res.status(201).json({ message: 'Usuario creado exitosamente', user });
    } catch (error) {
        // Manejar errores específicos (ej. email duplicado) si el servicio los lanza
        res.status(400).json({ message: error.message || "Error al crear el usuario." });
    }
};

/**
 * Controlador para iniciar sesión.
 */
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }

    try {
        const { username, password } = req.body;
        const token = await userService.loginUser(username, password);
        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        // El servicio ya lanza error con mensaje adecuado
        res.status(401).json({ message: error.message });
    }
};

// --- NUEVOS CONTROLADORES ---

/**
 * Controlador para obtener todos los usuarios.
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error al obtener los usuarios." });
    }
};

/**
 * Controlador para obtener un usuario por ID.
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message || "Error al obtener el usuario." });
    }
};

/**
 * Controlador para actualizar un usuario por ID.
 */
const updateUser = async (req, res) => {
    const errors = validationResult(req); // Validar datos de entrada
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }

    try {
        const { id } = req.params;
        const userData = req.body; // Datos a actualizar

        // Asegurarse de no intentar actualizar campos prohibidos (como el ID mismo)
        delete userData.id;

        const updatedUser = await userService.updateUser(id, userData);

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (error) {
        // Manejar errores específicos (ej. email duplicado al actualizar)
        res.status(400).json({ message: error.message || "Error al actualizar el usuario." });
    }
};

/**
 * Controlador para eliminar un usuario por ID.
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await userService.deleteUser(id);
        if (!success) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' }); // O 204 No Content
    } catch (error) {
        res.status(500).json({ message: error.message || "Error al eliminar el usuario." });
    }
};


module.exports = {
    createUser,
    loginUser,
    getAllUsers,   
    getUserById,   
    updateUser,    
    deleteUser     
};