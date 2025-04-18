// src/servicios/userService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRepository = require('../repositorios/userRepository'); // Importar todas las funciones

/**
 * Crea un nuevo usuario hasheando la contraseña.
 * @param {object} userData - Datos completos del usuario (nombreCompleto, documento, etc.).
 * @returns {Promise<User>} El usuario creado (sin la contraseña).
 */
const createUser = async (userData) => {
    // Validar que la contraseña existe antes de hashear
    if (!userData.password) {
        throw new Error("La contraseña es requerida para crear un usuario.");
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    // Crear el usuario con todos los datos y la contraseña hasheada
    const newUser = await userRepository.createUser({
        ...userData, // Incluir todos los campos pasados
        password: hashedPassword
    });
    // Devolver el usuario sin la contraseña por seguridad
    const { password, ...userWithoutPassword } = newUser.toJSON();
    return userWithoutPassword;
};

/**
 * Loguea un usuario y genera un token JWT.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña sin hashear.
 * @returns {Promise<string>} Token JWT.
 */
const loginUser = async (username, password) => {
    const user = await userRepository.getUserByUsername(username); // Ya incluye el rol

    if (!user) {
        throw new Error('Credenciales inválidas (usuario)');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new Error('Credenciales inválidas (contraseña)');
    }

    const roleName = user.role ? user.role.name : 'Rol Desconocido';

    // Payload del token: Incluir información útil pero no sensible
    const tokenPayload = {
        userId: user.id,
        username: user.username, // Incluir username
        nombreCompleto: user.nombreCompleto, // Incluir nombre
        roleId: user.roleId,
        roleName: roleName
    };

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("Error Crítico en userService: JWT_SECRET no definida!");
        throw new Error('Error interno del servidor (config JWT)');
    }

    try {
        const token = jwt.sign(
            tokenPayload,
            jwtSecret,
            { expiresIn: '3h' } // Duración del token
        );
        return token;

    } catch (signError) {
        console.error("Error al firmar el token JWT en userService:", signError);
        throw new Error('Error interno al generar la sesión.');
    }
};

// --- NUEVOS SERVICIOS ---

/**
 * Obtiene todos los usuarios.
 * @returns {Promise<Array<User>>} Lista de usuarios (sin contraseña).
 */
const getAllUsers = async () => {
    // El repositorio ya excluye la contraseña
    return userRepository.getAllUsers();
};

/**
 * Obtiene un usuario por ID.
 * @param {number|string} id - ID del usuario.
 * @returns {Promise<User|null>} Usuario encontrado o null (sin contraseña).
 */
const getUserById = async (id) => {
    // El repositorio ya excluye la contraseña
    return userRepository.getUserById(id);
};

/**
 * Actualiza un usuario. Hashea la contraseña si se proporciona una nueva.
 * @param {number|string} id - ID del usuario.
 * @param {object} userData - Datos a actualizar.
 * @returns {Promise<User|null>} El usuario actualizado (sin contraseña) o null si no se encontró.
 */
const updateUser = async (id, userData) => {
    // Si se incluye una nueva contraseña, hashearla
    if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
    } else {
        // Asegurarse de no enviar 'password: undefined' o 'password: null' si no se cambia
        delete userData.password;
    }

    // Realizar la actualización
    const [affectedRows] = await userRepository.updateUser(id, userData);

    if (affectedRows > 0) {
        // Si se actualizó, obtener y devolver el usuario actualizado (sin contraseña)
        return userRepository.getUserById(id);
    } else {
        // Si no se afectaron filas (usuario no encontrado)
        return null; // O lanzar un error si se prefiere
    }
};

/**
 * Elimina un usuario por ID.
 * @param {number|string} id - ID del usuario.
 * @returns {Promise<boolean>} True si se eliminó, false si no.
 */
const deleteUser = async (id) => {
    const deletedRows = await userRepository.deleteUser(id);
    return deletedRows > 0; // Devuelve true si se eliminó al menos una fila
};
// --- FIN NUEVOS SERVICIOS ---

module.exports = {
    createUser,
    loginUser,
    getAllUsers,   // Exportar nuevo servicio
    getUserById,   // Exportar nuevo servicio
    updateUser,    // Exportar nuevo servicio
    deleteUser     // Exportar nuevo servicio
};