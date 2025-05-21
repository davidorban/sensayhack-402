// Payment routes
import express from 'express';
import { PaymentController } from '../controllers/payment-controller.js';

const router = express.Router();

// Payment verification endpoint
router.post('/verify', PaymentController.verifyPayment);

// Payment status endpoint
router.get('/status/:paymentId', PaymentController.checkPaymentStatus);

// Payment details endpoint
router.get('/details/:paymentId', PaymentController.getPaymentDetails);

export default router;