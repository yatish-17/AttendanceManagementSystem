const express = require('express');

const {
    getAttendance,
    getAbsentEmployees,
    getLateEmployees,
    getEarlyLeaveEmployees,
    checkIn,
    checkOut
} = require('../controllers/attendanceController');

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authenticateToken, getAttendance);
router.get(
    '/absent',
    authenticateToken,
    authorizeRoles('Admin'),
    getAbsentEmployees
);

router.get(
    '/late',
    authenticateToken,
    authorizeRoles('Admin'),
    getLateEmployees
);

router.get(
    '/early-leave',
    authenticateToken,
    authorizeRoles('Admin'),
    getEarlyLeaveEmployees
);

router.post('/check-in', authenticateToken, checkIn);
router.post('/check-out', authenticateToken, checkOut);

module.exports = router;