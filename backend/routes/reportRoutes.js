// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');



router.post('/reports', authMiddleware, reportController.createReport);
router.get('/reports', authMiddleware, reportController.getReports);
router.put('/reports/:reportId', authMiddleware, reportController.updateReportStatus);
router.delete('/reports/:reportId', authMiddleware, reportController.deleteReport);

module.exports = router;
