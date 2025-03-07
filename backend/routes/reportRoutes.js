// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');



router.post('/reports', authMiddleware,reportController.createReport);
router.get('/reports', reportController.getReports);
router.put('/reports/:reportId', reportController.updateReportStatus);
router.delete('/reports/:reportId', reportController.deleteReport);
router.get('/reports/:reportId', reportController.getReportById);
router.get('/reports/user/:userId', reportController.getReportsForReportedUser);


module.exports = router;
