// src/modelos/associations.js

const Client = require('./client');
const Contract = require('./contract');
const SpecimenCategory = require('./SpecimenCategory');
const Sede = require('./sede');
const Specimen = require('./Specimen');
const Pago = require('./pagos'); // Verifica nombre archivo
const Service = require('./Service');
const ContractService = require('./ContractService');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Medicine = require('./Medicine');
const Vacunacion = require('./Vacunacion');
const Alimentacion = require('./Alimentacion'); // <-- IMPORTANTE: Importar Alimentacion
const sequelize = require('../config/database');
// Verifica que los modelos se importaron
console.log('[Associations] Modelos Cargados:', {
    Client: !!Client, Contract: !!Contract, SpecimenCategory: !!SpecimenCategory, Sede: !!Sede, Specimen: !!Specimen,
    Pago: !!Pago, Service: !!Service, ContractService: !!ContractService, User: !!User, Role: !!Role, Permission: !!Permission, RolePermission: !!RolePermission,
    Medicine: !!Medicine,
    Vacunacion: !!Vacunacion,
    Alimentacion: !!Alimentacion });

// Client <-> Contract
Client.hasMany(Contract, { foreignKey: 'clientId', as: 'contracts' });
Contract.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Client <-> Specimen
Client.hasMany(Specimen, { foreignKey: 'clientId', as: 'ownedSpecimens' });
Specimen.belongsTo(Client, { foreignKey: 'clientId', as: 'propietario' });

// Sede <-> Specimen
Sede.hasMany(Specimen, { foreignKey: 'sedeId', as: 'ejemplaresEnSede' });
Specimen.belongsTo(Sede, { foreignKey: 'sedeId', as: 'sede' });

// SpecimenCategory <-> Specimen
SpecimenCategory.hasMany(Specimen, { foreignKey: 'specimenCategoryId', as: 'ejemplaresDeCategoria' });
Specimen.belongsTo(SpecimenCategory, { foreignKey: 'specimenCategoryId', as: 'category' });

// Contract <-> Specimen
Contract.hasMany(Specimen, { foreignKey: 'contractId', as: 'contractSpecimens' });
Specimen.belongsTo(Contract, { foreignKey: 'contractId', as: 'contract' });

// Contract <-> Pago
if (Pago) {
    Contract.hasMany(Pago, { foreignKey: 'contractId', as: 'pagos' });
    Pago.belongsTo(Contract, { foreignKey: 'contractId', as: 'contract' });
}

// Contract <-> Service
Contract.belongsToMany(Service, { through: ContractService, as: 'servicios', foreignKey: 'contractId', otherKey: 'serviceId' });
Service.belongsToMany(Contract, { through: ContractService, as: 'contracts', foreignKey: 'serviceId', otherKey: 'contractId' });

// Role <-> Permission
Role.belongsToMany(Permission, { through: RolePermission, as: 'permissions', foreignKey: 'roleId', otherKey: 'permissionId' });
Permission.belongsToMany(Role, { through: RolePermission, as: 'roles', foreignKey: 'permissionId', otherKey: 'roleId' });

// User <-> Role
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// Medicine <-> Specimen
if (Medicine && Specimen) {
    Medicine.belongsTo(Specimen, { foreignKey: 'specimenId', as: 'specimen' });
    Specimen.hasMany(Medicine, { foreignKey: 'specimenId', as: 'medicines' });
}

// Vacunacion <-> Specimen
if (Vacunacion && Specimen) {
    Vacunacion.belongsTo(Specimen, { foreignKey: 'specimenId', as: 'specimen' });
    Specimen.hasMany(Vacunacion, { foreignKey: 'specimenId', as: 'vacunaciones' });
}

// *** NUEVA ASOCIACIÓN: Alimentacion <-> Specimen ***
if (Alimentacion && Specimen) {
    // Una Alimentacion pertenece a un Specimen
    Alimentacion.belongsTo(Specimen, { foreignKey: 'specimenId', as: 'specimen' }); // Asume alias 'specimen'
    // Un Specimen puede tener muchos registros de Alimentacion
    Specimen.hasMany(Alimentacion, { foreignKey: 'specimenId', as: 'alimentaciones' });
}
// ----------------------------------------------------


module.exports = {
    Client, Contract, SpecimenCategory, Sede, Specimen,
    Pago, Service, ContractService, User, Role, Permission, RolePermission,
    Medicine,
    Vacunacion,
    Alimentacion, // <-- EXPORTAR Alimentacion
    sequelize
};