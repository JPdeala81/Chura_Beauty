import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);

router.post('/', protect, upload.array('images'), createService);
router.put('/:id', protect, upload.array('images'), updateService);
router.delete('/:id', protect, deleteService);
router.patch('/:id/toggle', protect, toggleServiceStatus);

export default router;
