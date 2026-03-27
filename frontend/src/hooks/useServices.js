import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as serviceService from '../services/serviceService';

export const useServices = () => {
  const { token } = useContext(AuthContext);

  const getAllServices = async (params) => {
    return serviceService.getAllServices(params);
  };

  const getServiceById = async (id) => {
    return serviceService.getServiceById(id);
  };

  const createService = async (data) => {
    return serviceService.createService(data);
  };

  const updateService = async (id, data) => {
    return serviceService.updateService(id, data);
  };

  const deleteService = async (id) => {
    return serviceService.deleteService(id);
  };

  const toggleStatus = async (id) => {
    return serviceService.toggleServiceStatus(id);
  };

  return {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    toggleStatus,
  };
};
