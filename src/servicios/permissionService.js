const permissionRepository = require('../repositorios/permissionRepository');

const createPermission = async (permission) => {
  return permissionRepository.createPermission(permission);
};

const getAllPermissions = async () => {
  return permissionRepository.getAllPermissions();
};

const getPermissionById = async (id) => {
  return permissionRepository.getPermissionById(id);
};

const updatePermission = async (id, permission) => {
  return permissionRepository.updatePermission(id, permission);
};

const deletePermission = async (id) => {
  return permissionRepository.deletePermission(id);
};

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
};