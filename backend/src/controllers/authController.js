
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({
    path: require('path').resolve(__dirname, '../../.env')
});
const { sql } = require('../config/db');

const login = async (req, res) => {
    try {
        const { Employee_code, password } = req.body;

        // Validate input
        if (!Employee_code || !password) {
            return res.status(400).json({
                message: 'Employee code and password are required'
            });
        }

        // Find employee
        const request = new sql.Request();

        request.input(
            'Employee_code',
            sql.VarChar,
            Employee_code
        );

        const result = await request.query(`
            SELECT
                Employee_id,
                Employee_code,
                Name,
                Email,
                Role,
                Password_hash,
                Is_Active
            FROM Employees
            WHERE Employee_code = @Employee_code
        `);

        // Employee doesn't exist
        if (result.recordset.length === 0) {
            return res.status(401).json({
                message: 'Invalid employee code or password'
            });
        }

        const employee = result.recordset[0];

        // Check whether account is active
        if (!employee.Is_Active) {
            return res.status(403).json({
                message: 'Employee account is disabled'
            });
        }

        // Compare password with stored hash
        const passwordMatch = await bcrypt.compare(
            password,
            employee.Password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid employee code or password'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                Employee_id: employee.Employee_id,
                Employee_code: employee.Employee_code,
                Role: employee.Role
            },
           process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        // Login successful
        res.json({
            message: 'Login successful',
            token: token,
            employee: {
                Employee_id: employee.Employee_id,
                Employee_code: employee.Employee_code,
                Name: employee.Name,
                Email: employee.Email,
                Role: employee.Role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Login failed'
        });
    }
};

module.exports = {
    login
};