const express = require('express');

const {
    getEmployees,
    getDepartments,
    addEmployee,
    updateEmployee,
    disableEmployee,
    reactivateEmployee
} = require('../controllers/employeeController');

const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();


// Get all employees

router.get(
    '/',
    authenticateToken,
    authorizeRoles('Admin'),
    getEmployees
);


// Get all departments

router.get(
    '/departments',
    authenticateToken,
    authorizeRoles('Admin'),
    getDepartments
);


// Add employee

router.post(
    '/',
    authenticateToken,
    authorizeRoles('Admin'),
    addEmployee
);


// Update employee

router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('Admin'),
    updateEmployee
);


// Disable employee

router.patch(
    '/:id/disable',
    authenticateToken,
    authorizeRoles('Admin'),
    disableEmployee
);


// Reactivate employee

router.patch(
    '/:id/reactivate',
    authenticateToken,
    authorizeRoles('Admin'),
    reactivateEmployee
);


module.exports = router;