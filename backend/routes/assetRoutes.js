import express from 'express';
import { getBases, getEquipmentTypes, getDashboardMetrics, getInventoryStatus, getAuditLogs } from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/bases', getBases);
router.get('/equipment-types', getEquipmentTypes);
router.get('/dashboard-metrics', enforceBaseScope, getDashboardMetrics);
router.get('/status', enforceBaseScope, getInventoryStatus);
router.get('/audit-logs', enforceBaseScope, getAuditLogs);

export default router;
