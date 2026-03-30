import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  debugAllServices,
  activateAllServices,
} from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/debug/all', debugAllServices);
router.post('/debug/activate-all', activateAllServices);
router.get('/:id', getServiceById);

// Protected routes
router.post('/', protect, upload.array('images'), createService);
router.put('/:id', protect, upload.array('images'), updateService);
router.delete('/:id', protect, deleteService);
router.patch('/:id/toggle', protect, toggleServiceStatus);

export default router;
