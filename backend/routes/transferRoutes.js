import express from 'express';
import { createTransfer, getTransfers } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Create transfer: Admin, Logistics, and Commanders can create transfers (Commanders scoped to their base)
router.post('/', authorizeRoles('ADMIN', 'LOGISTICS_OFFICER', 'BASE_COMMANDER'), enforceBaseScope, createTransfer);

// Get transfer history: accessible to all, but scoped to commander base if applicable
router.get('/', enforceBaseScope, getTransfers);

export default router;
