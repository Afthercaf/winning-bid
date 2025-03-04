// routes/reportRoutes.js
import express from 'express';
import { createReport, getReports, updateReportStatus, deleteReport } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/reports', authenticate, createReport);
router.get('/reports', authenticate, getReports);
router.put('/reports/:reportId', authenticate, updateReportStatus);
router.delete('/reports/:reportId', authenticate, deleteReport);

export default router;