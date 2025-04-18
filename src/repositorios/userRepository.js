// src/repositorios/userRepository.js
const User = require('../modelos/User');
const Role = require('../modelos/Role'); // Importar Role para incluirlo

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {object} userData - Datos del usuario (incluyendo los nuevos campos).
 * @returns {Promise<User>} El usuario creado.
 */
const createUser = async (userData) => {
    // Asegúrate de pasar todos los campos necesarios del objeto userData
    return User.create(userData);
};

/**
 * Obtiene un usuario por su nombre de usuario, incluyendo su rol.
 * @param {string} username - Nombre de usuario.
 * @returns {Promise<User|null>} El usuario encontrado o null.
 */
const getUserByUsername = async (username) => {
    return User.findOne({
        where: { username },
        include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }] // Incluir rol
    });
};

// --- NUEVAS FUNCIONES ---

/**
 * Obtiene todos los usuarios, incluyendo su rol.
 * @returns {Promise<Array<User>>} Array de usuarios.
 */
const getAllUsers = async () => {
    return User.findAll({
        include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }], // Incluir nombre del rol
        attributes: { exclude: ['password'] } // Excluir contraseña de la respuesta
    });
};

/**
 * Obtiene un usuario por su ID, incluyendo su rol.
 * @param {number|string} id - ID del usuario.
 * @returns {Promise<User|null>} El usuario encontrado o null.
 */
const getUserById = async (id) => {
    return User.findByPk(id, {
        include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
        attributes: { exclude: ['password'] }
    });
};


/**
 * Actualiza un usuario por su ID.
 * @param {number|string} id - ID del usuario a actualizar.
 * @param {object} userData - Datos a actualizar.
 * @returns {Promise<Array<number>>} Array con el número de filas afectadas (debería ser [1] si tuvo éxito).
 */
const updateUser = async (id, userData) => {
    // userData no debería incluir el ID aquí, se usa en el where
    // Asegúrate de que la contraseña no se actualice si no se proporciona en userData
    return User.update(userData, {
        where: { id: id }
    });
};

/**
 * Elimina un usuario por su ID.
 * @param {number|string} id - ID del usuario a eliminar.
 * @returns {Promise<number>} Número de filas eliminadas (debería ser 1).
 */
const deleteUser = async (id) => {
    return User.destroy({
        where: { id: id }
    });
};
// --- FIN NUEVAS FUNCIONES ---


module.exports = {
    createUser,
    getUserByUsername,
    getAllUsers,   // Exportar nueva función
    getUserById,   // Exportar nueva función
    updateUser,    // Exportar nueva función
    deleteUser     // Exportar nueva función
};