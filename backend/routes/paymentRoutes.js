import express from 'express'
import paymentController from '../controllers/paymentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/sessions', paymentController.createPaymentSession)
router.get('/sessions/:sessionCode', paymentController.getPaymentSession)
router.get('/faqs', paymentController.getAllFAQs)
router.get('/faqs/categories', paymentController.getFAQCategories)

// Protected routes (admin only)
router.post('/sessions/:sessionId/screenshot', protect, paymentController.uploadPaymentScreenshot)
router.post('/sessions/:sessionId/confirm', protect, paymentController.confirmPayment)
router.post('/sessions/:sessionId/reject', protect, paymentController.rejectPayment)
router.get('/sessions', protect, paymentController.getPaymentSessions)
router.post('/faqs', protect, paymentController.createFAQ)
router.delete('/faqs/:faqId', protect, paymentController.deleteFAQ)

export default router
