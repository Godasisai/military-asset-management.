import express from 'express';
import { createPurchase, getPurchases } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Create purchase: restricted to Admin and Logistics Officer
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createPurchase);

// Get purchase history: accessible to all, but scoped to commander base if applicable
router.get('/', enforceBaseScope, getPurchases);

export default router;
