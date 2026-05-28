import { useState, useCallback, useEffect } from 'react';
import * as serviceService from '../services/serviceService';

export const useServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPrice, setFilterPrice] = useState({ min: 0, max: Infinity });

  // Fetch all services
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await serviceService.getAllServices();
      const servicesData = Array.isArray(response.data?.services)
        ? response.data.services
        : Array.isArray(response.data)
          ? response.data
          : [];
      setServices(servicesData);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create service
  const createService = useCallback(async (formData) => {
    try {
      setError('');
      await serviceService.createService(formData);
      await fetchServices();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la création';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [fetchServices]);

  // Update service
  const updateService = useCallback(async (id, formData) => {
    try {
      setError('');
      await serviceService.updateService(id, formData);
      await fetchServices();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la mise à jour';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [fetchServices]);

  // Delete service
  const deleteService = useCallback(async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      return { success: false };
    }

    try {
      setError('');
      await serviceService.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id && s._id !== id));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, []);

  // Filtered services
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm ||
      service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !filterCategory || service.category === filterCategory;

    const matchesPrice = service.price >= filterPrice.min &&
      service.price <= filterPrice.max;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Get unique categories
  const categories = [...new Set(services
    .map(s => s.category)
    .filter(Boolean)
    .sort())];

  // Initial fetch
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    filteredServices,
    categories,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filterPrice,
    setFilterPrice,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
};

export default useServiceManagement;
