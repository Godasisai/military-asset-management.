import express from 'express';
import { createAssignment, returnAssignment, getAssignments } from '../controllers/assignmentController.js';
import { createExpenditure, getExpenditures } from '../controllers/expenditureController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Assignments routes
router.post('/assignments', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), enforceBaseScope, createAssignment);
router.post('/assignments/:assignmentId/return', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), returnAssignment);
router.get('/assignments', enforceBaseScope, getAssignments);

// Expenditures routes
router.post('/expenditures', authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), enforceBaseScope, createExpenditure);
router.get('/expenditures', enforceBaseScope, getExpenditures);

export default router;
