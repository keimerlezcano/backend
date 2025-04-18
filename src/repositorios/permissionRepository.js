const Permission = require('../modelos/Permission');

const createPermission = async (permission) => {
  return Permission.create(permission);
};

const getAllPermissions = async () => {
  return Permission.findAll();
};

const getPermissionById = async (id) => {
  return Permission.findByPk(id);
};

const updatePermission = async (id, permission) => {
  return Permission.update(permission, { where: { id } });
};

const deletePermission = async (id) => {
  return Permission.destroy({ where: { id } });
};

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
};