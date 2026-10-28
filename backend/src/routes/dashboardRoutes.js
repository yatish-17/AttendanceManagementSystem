const express = require('express');

const {
    getDashboard
} = require('../controllers/dashboardController');

const authenticateToken =
    require('../middleware/authMiddleware');

const authorizeRoles =
    require('../middleware/roleMiddleware');


const router = express.Router();


router.get(
    '/',
    authenticateToken,
    authorizeRoles('Admin'),
    getDashboard
);


module.exports = router;