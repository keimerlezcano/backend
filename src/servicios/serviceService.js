// src/servicios/serviceService.js
const serviceRepository = require('../repositorios/serviceRepository'); // Ajusta ruta
const fs = require('fs');
const path = require('path');
const Service = require('../modelos/Service'); 

// --- Crear Servicio ---
const createService = async (serviceData, fileInfo) => {
  console.log("[Service:createService] Datos Recibidos:", serviceData);
  console.log("[Service:createService] Info Archivo:", fileInfo);
  try {
    // Prepara datos SIN precio
    const dataToSave = {
      nombre: serviceData.nombre?.trim(),
      descripcion: serviceData.descripcion?.trim() || null,
      imagen: fileInfo ? fileInfo.path : null // Ruta de la imagen si existe
    };

    // Validación básica (el controller ya hizo validación de formato)
    if (!dataToSave.nombre) {
        throw new Error("El nombre del servicio es obligatorio.");
    }

    console.log("[Service:createService] Datos a Guardar en DB:", dataToSave);
    const newService = await serviceRepository.createService(dataToSave);
    return newService;
  } catch (error) {
    console.error("Error en serviceService.createService:", error);
    if (fileInfo?.path) {
       fs.unlink(fileInfo.path, (err) => { if (err) console.error("Error borrando archivo tras fallo:", err);});
    }
    throw new Error(error.message || "Error al procesar la creación del servicio.");
  }
};

// --- Actualizar Servicio ---
const updateService = async (id, serviceData, fileInfo) => {
    console.log(`[Service:updateService ID: ${id}] Datos Recibidos:`, serviceData);
    console.log(`[Service:updateService ID: ${id}] Info Archivo:`, fileInfo);
    try {
        const serviceId = parseInt(id, 10);
        if (isNaN(serviceId)) throw new Error("ID de servicio inválido.");

        const existingService = await serviceRepository.getServiceById(serviceId); // Usa tu repo
        if (!existingService) {
            const error = new Error('Servicio no encontrado para actualizar');
            error.statusCode = 404;
            throw error;
        }
        const oldImagePath = existingService.imagen;

        // Prepara datos a actualizar (SIN precio)
        const dataToUpdate = {};
        if (typeof serviceData.nombre === 'string') dataToUpdate.nombre = serviceData.nombre.trim();
        if (typeof serviceData.descripcion === 'string') dataToUpdate.descripcion = serviceData.descripcion.trim();

        let newImagePath = null;
        if (fileInfo) {
            newImagePath = fileInfo.path;
            dataToUpdate.imagen = newImagePath; // Actualiza imagen si se subió una nueva
        }

        console.log(`[Service:updateService ID: ${id}] Datos a Actualizar en DB:`, dataToUpdate);

        // Llama al repositorio para actualizar. updateService debe devolver el objeto actualizado o null/0
        const updatedResult = await serviceRepository.updateService(serviceId, dataToUpdate);

        // Verifica si la actualización tuvo efecto (depende de lo que devuelva tu repo)
        // if (!updatedResult || updatedResult === 0 || (Array.isArray(updatedResult) && updatedResult[0] === 0) ) {
             // Podrías lanzar un error si la actualización no afectó filas, aunque findByPk ya lo hizo.
        // }


        // Borra imagen antigua si se subió una nueva
        if (newImagePath && oldImagePath && oldImagePath !== newImagePath) {
             const absoluteOldPath = path.resolve(oldImagePath);
             fs.unlink(absoluteOldPath, (unlinkErr) => {
                  if (unlinkErr && unlinkErr.code !== 'ENOENT') console.error(`Error al borrar imagen antigua ${absoluteOldPath}:`, unlinkErr);
                  else if (!unlinkErr) console.log(`Imagen antigua ${absoluteOldPath} borrada.`);
             });
        }

        // Devuelve el servicio actualizado buscándolo de nuevo
        return await serviceRepository.getServiceById(serviceId);

    } catch (error) {
        // Borra archivo nuevo si la actualización falló
        if (fileInfo?.path) {
           fs.unlink(fileInfo.path, (err) => { if (err) console.error("Error borrando archivo nuevo tras fallo:", err);});
        }
        if (error.message !== 'Servicio no encontrado para actualizar' && error.message !== 'ID de servicio inválido.') {
            console.error(`Error en serviceService.updateService (ID: ${id}):`, error);
        }
        throw error;
    }
};


// --- Otros servicios (getAll, getById, delete) ---
// Asume que serviceRepository.getAllServices/getById/deleteService funcionan correctamente
const getAllServices = async () => {
    try {
        return await serviceRepository.getAllServices();
    } catch (error) {
        console.error("Error en serviceService.getAllServices:", error);
        throw new Error("Error al obtener los servicios.");
    }
};
const getServiceById = async (id) => {
    try {
        const serviceId = parseInt(id, 10);
        if (isNaN(serviceId)) throw new Error("ID de servicio inválido.");
        const service = await serviceRepository.getServiceById(serviceId);
        if (!service) {
            const error = new Error('Servicio no encontrado');
            error.statusCode = 404;
            throw error;
        }
        return service;
    } catch (error) {
        if (error.message !== 'Servicio no encontrado' && error.message !== 'ID de servicio inválido.') {
             console.error(`Error en serviceService.getServiceById (ID: ${id}):`, error);
        }
        throw error;
    }
};
const deleteService = async (id) => {
   try {
        const serviceId = parseInt(id, 10);
        if (isNaN(serviceId)) throw new Error("ID de servicio inválido.");
        const serviceToDelete = await serviceRepository.getServiceById(serviceId);
        // Si no lo encuentra, getServiceById ya lanza error 404

        await serviceRepository.deleteService(serviceId); // Lanza error si falla

        // Borra imagen si existía
        if (serviceToDelete?.imagen) {
             const absolutePath = path.resolve(serviceToDelete.imagen);
             fs.unlink(absolutePath, (unlinkErr) => {
                  if (unlinkErr && unlinkErr.code !== 'ENOENT') console.error(`Error al borrar imagen ${absolutePath}:`, unlinkErr);
                  else if (!unlinkErr) console.log(`Imagen ${absolutePath} borrada.`);
             });
        }
    } catch (error) {
         if (error.message !== 'Servicio no encontrado' && error.message !== 'ID de servicio inválido.') {
             console.error(`Error en serviceService.deleteService (ID: ${id}):`, error);
         }
        throw error;
    }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
};