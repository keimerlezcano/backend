// src/servicios/roleService.js

// Asegúrate que la ruta a los modelos sea correcta y que 'associations.js'
// defina correctamente la relación Role.belongsToMany(Permission, { as: 'permissions', ... });
const { Role, Permission } = require('../modelos/associations'); // Asumiendo que aquí se definen los modelos y sus asociaciones

// --- Función Helper (Interna) ---
// Busca los IDs de permisos basados en un array de nombres de permiso.
const getPermissionIdsFromNames = async (permissionNames) => {
    // Si no hay nombres o no es un array, devuelve un array vacío.
    if (!permissionNames || !Array.isArray(permissionNames) || permissionNames.length === 0) {
        return [];
    }
    try {
        // Busca en la tabla Permission donde el nombre esté en la lista proporcionada.
        const permissions = await Permission.findAll({
            where: { name: permissionNames },
            attributes: ['id'] // Solo necesitamos los IDs.
        });
        // Devuelve un array solo con los IDs encontrados.
        return permissions.map(p => p.id);
    } catch (error) {
        console.error("Error buscando IDs de permisos por nombre:", error);
        // Lanza un error genérico para que sea manejado por la función que llama.
        throw new Error("Error al procesar permisos.");
    }
};

// --- Función para transformar la salida (Interna) ---
// Convierte la instancia del modelo Sequelize Role en un objeto plano
// y formatea la propiedad 'permissions' para que sea un array de nombres.
const transformRoleOutput = (roleInstance) => {
    if (!roleInstance) return null; // Si no hay instancia, devuelve null.

    // Convierte la instancia Sequelize a un objeto JavaScript plano.
    // Esto incluye las asociaciones cargadas (como 'permissions').
    const plainRole = roleInstance.get({ plain: true });

    // Accede a la propiedad 'permissions' (el alias definido en la asociación).
    // Si existe y es un array, mapea cada objeto de permiso a su nombre.
    // Si no existe o no es un array, asigna un array vacío.
    plainRole.permissions = plainRole.permissions && Array.isArray(plainRole.permissions)
        ? plainRole.permissions.map(p => p.name)
        : [];

    // ----- ¡CORRECCIÓN APLICADA! -----
    // YA NO eliminamos la propiedad 'permissions' que acabamos de formatear.
    // Esta propiedad es la que el frontend espera recibir.
    // delete plainRole.permissions; // <-- ESTA LÍNEA HA SIDO ELIMINADA

    // Devuelve el objeto plano formateado.
    return plainRole;
};


// --- Funciones del Servicio (Exportadas) ---

/**
 * Crea un nuevo rol y le asocia los permisos especificados por nombre.
 * @param {string} name - Nombre del nuevo rol.
 * @param {string[]} permissionNames - Array de nombres de los permisos a asignar.
 * @returns {Promise<object>} El rol creado con sus permisos (formateado).
 */
const createRole = async (name, permissionNames) => {
    try {
        // 1. Crea el rol básico.
        const role = await Role.create({ name });
        // 2. Obtiene los IDs de los permisos a partir de sus nombres.
        const permissionIds = await getPermissionIdsFromNames(permissionNames);

        // 3. Si se encontraron IDs de permisos válidos...
        if (permissionIds.length > 0) {
            // Busca las instancias completas de Permission correspondientes a esos IDs.
            const permissionsToAssociate = await Permission.findAll({ where: { id: permissionIds } });
            // Si se encontraron instancias de Permission...
            if (permissionsToAssociate.length > 0) {
                // Usa el método 'setPermissions' (generado por Sequelize al definir la asociación 'as: permissions')
                // para establecer la relación Many-to-Many. Esto reemplaza cualquier permiso anterior (útil para crear y actualizar).
                await role.setPermissions(permissionsToAssociate);
            }
             // Advertencia si algunos nombres no correspondían a IDs válidos.
             if (permissionsToAssociate.length !== permissionIds.length || permissionsToAssociate.length !== permissionNames?.length) {
                 console.warn(`createRole: Algunos nombres de permiso proporcionados no fueron encontrados o eran inválidos: ${permissionNames}`);
             }
        }
        // 4. Obtiene y devuelve el rol recién creado con sus permisos formateados.
        // Llama a getRoleById para asegurar consistencia en el formato de salida.
        return getRoleById(role.id);
    } catch (error) {
        console.error("Error en roleService.createRole:", error);
        // Propaga un error más descriptivo.
        throw new Error(`Error al crear el rol: ${error.message}`);
    }
};

/**
 * Obtiene todos los roles, incluyendo sus permisos asociados (solo los nombres).
 * @returns {Promise<object[]>} Un array de roles formateados.
 */
const getAllRoles = async () => {
    try {
        const roles = await Role.findAll({
            // Incluye la asociación 'permissions'.
            include: [{
                model: Permission,
                as: 'permissions', // Debe coincidir con el alias en associations.js
                attributes: ['name'], // Solo traer el nombre del permiso.
                through: { attributes: [] } // No traer datos de la tabla intermedia (RolePermissions).
            }],
            order: [['id', 'ASC']] // Ordena los roles por ID.
        });
        // Mapea cada instancia de rol usando la función de transformación.
        return roles.map(transformRoleOutput);
    } catch (error) {
        console.error("Error en roleService.getAllRoles:", error);
        throw new Error("Error al obtener los roles."); // Mensaje genérico.
    }
};

/**
 * Obtiene un rol específico por su ID, incluyendo sus permisos (solo nombres).
 * @param {number|string} id - El ID del rol a buscar.
 * @returns {Promise<object|null>} El rol formateado o null si no se encuentra.
 */
const getRoleById = async (id) => {
    try {
        const roleId = parseInt(id, 10); // Asegura que el ID sea un número.
        if (isNaN(roleId)) throw new Error("ID de rol inválido.");

        const role = await Role.findByPk(roleId, {
            // Incluye la asociación 'permissions' como en getAllRoles.
            include: [{
                model: Permission,
                as: 'permissions', // Alias crucial.
                attributes: ['name'],
                through: { attributes: [] }
            }]
        });

        // Si no se encuentra el rol, lanza un error 404.
        if (!role) {
            const error = new Error("Rol no encontrado.");
            error.statusCode = 404; // Añade un código de estado para el controlador.
            throw error;
        }
        // Transforma la salida antes de devolverla.
        return transformRoleOutput(role);
    } catch (error) {
        // Evita loguear errores esperados como 'Not Found' o 'Invalid ID' de forma redundante si ya los manejas.
        if (error.statusCode !== 404 && error.message !== "ID de rol inválido.") {
             console.error(`Error en roleService.getRoleById (ID: ${id}):`, error);
        }
        throw error; // Propaga el error (con o sin statusCode).
    }
};

/**
 * Actualiza un rol (nombre y/o permisos).
 * @param {number|string} id - ID del rol a actualizar.
 * @param {object} roleData - Datos a actualizar. Puede contener 'name' y/o 'permissions' (array de nombres).
 * @returns {Promise<object>} El rol actualizado y formateado.
 */
const updateRole = async (id, roleData) => {
    try {
        const roleId = parseInt(id, 10);
        if (isNaN(roleId)) throw new Error("ID de rol inválido.");

        // 1. Busca el rol existente.
        const role = await Role.findByPk(roleId);
        if (!role) {
            const error = new Error('Rol no encontrado para actualizar.');
            error.statusCode = 404;
            throw error;
        }

        // 2. Actualiza el nombre si se proporcionó y es una cadena.
        if (typeof roleData.name === 'string') {
           // trim() elimina espacios en blanco al inicio/final.
           await role.update({ name: roleData.name.trim() });
        }

        // 3. Actualiza los permisos si se proporcionó un array 'permissions'.
        // Nota: Si se pasa un array vacío [], eliminará todos los permisos.
        if (Array.isArray(roleData.permissions)) {
            const permissionIds = await getPermissionIdsFromNames(roleData.permissions);
            const permissionsToAssociate = await Permission.findAll({ where: { id: permissionIds } });
            // setPermissions reemplaza TODOS los permisos existentes por los nuevos.
            await role.setPermissions(permissionsToAssociate);
             // Advertencia si hubo nombres inválidos.
             if (permissionsToAssociate.length !== permissionIds.length || permissionsToAssociate.length !== roleData.permissions.length) {
                 console.warn(`updateRole (ID: ${roleId}): Algunos nombres de permiso proporcionados no fueron encontrados o eran inválidos.`);
             }
        }

        // 4. Devuelve el rol actualizado, volviendo a buscarlo para obtener el estado final
        // con los permisos correctamente formateados.
        return getRoleById(roleId);

    } catch (error) {
         // Evita loguear el error 404 si ya lo lanzaste tú.
        if (error.statusCode !== 404 && error.message !== "ID de rol inválido.") {
            console.error(`Error en roleService.updateRole (ID: ${id}):`, error);
        }
        throw error; // Propaga el error.
    }
};

/**
 * Elimina un rol por su ID.
 * @param {number|string} id - ID del rol a eliminar.
 * @returns {Promise<void>}
 */
const deleteRole = async (id) => {
    try {
        const roleId = parseInt(id, 10);
        if (isNaN(roleId)) throw new Error("ID de rol inválido.");

        // 1. Busca el rol para asegurarse de que existe y para poder quitar asociaciones.
        const role = await Role.findByPk(roleId);
        if (!role) {
             // Si no se encuentra, lanza error 404.
             const error = new Error('Rol no encontrado para eliminar');
             error.statusCode = 404;
             throw error;
        }

        // 2. (Buena práctica) Elimina las asociaciones en la tabla intermedia antes de borrar el rol.
        // Pasando un array vacío a setPermissions se eliminan todas las asociaciones.
        await role.setPermissions([]);

        // 3. Elimina el rol de la tabla Roles.
        const result = await Role.destroy({ where: { id: roleId } });

        // 4. Verificación adicional (aunque findByPk ya lo hizo): si destroy devuelve 0 filas afectadas,
        // podría indicar que el rol ya no existía (quizás eliminado por otro proceso).
        if (result === 0) {
           // Esto no debería pasar si el findByPk anterior funcionó, pero es una doble comprobación.
           console.warn(`deleteRole (ID: ${roleId}): Role.destroy devolvió 0, posible condición de carrera o rol ya eliminado.`);
           // Podrías relanzar el 404 si quieres ser estricto.
           // const error = new Error('Rol no encontrado para eliminar (confirmación post-destroy)');
           // error.statusCode = 404;
           // throw error;
        }

    } catch (error) {
        // Evita loguear el error 404 si ya lo lanzaste tú.
        if (error.statusCode !== 404 && error.message !== "ID de rol inválido.") {
             console.error(`Error en roleService.deleteRole (ID: ${id}):`, error);
        }
        throw error; // Propaga el error.
    }
};

// Exporta las funciones públicas del servicio.
module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
};