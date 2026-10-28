const bcrypt = require('bcryptjs');
const { sql } = require('../config/db');


const getEmployees = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT
                Employee_id,
                Employee_code,
                Name,
                Email,
                Role,
                Department_id,
                Joining_Date,
                Is_Active
            FROM Employees
        `);

        res.json(result.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Failed to fetch employees'
        });
    }
};


// Get departments for Admin Employee Management

const getDepartments = async (req, res) => {
    try {

        const result = await sql.query(`
            SELECT
                Department_id,
                Department_name
            FROM Departments
            ORDER BY Department_name
        `);

        res.json(result.recordset);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Failed to fetch departments'
        });
    }
};


// we are building Admin Dashboard
// ADD EMPLOYEE function

const addEmployee = async (req, res) => {
    try {

        const {
            Employee_code,
            Name,
            Email,
            Role,
            Department_id,
            Joining_Date,
            password
        } = req.body;


        // Password is required for a new employee

        if (!password) {
            return res.status(400).json({
                message: 'Password is required'
            });
        }


        // Hash password before storing it

        const passwordHash = await bcrypt.hash(
            password,
            10
        );


        const result = await sql.query`
            INSERT INTO Employees
            (
                Employee_code,
                Name,
                Email,
                Role,
                Department_id,
                Joining_Date,
                Password_hash,
                Is_Active
            )
            OUTPUT INSERTED.*
            VALUES
            (
                ${Employee_code},
                ${Name},
                ${Email},
                ${Role},
                ${Department_id},
                ${Joining_Date},
                ${passwordHash},
                1
            )
        `;


        res.status(201).json(
            result.recordset[0]
        );

    } catch (error) {

        console.error(error);

        // Duplicate Employee Code / unique value

        if (
            error.number === 2627 ||
            error.number === 2601
        ) {
            return res.status(409).json({
                message:
                    'Employee code already exists'
            });
        }


        res.status(500).json({
            message: 'Failed to add employee'
        });
    }
};


// Edit employee function

const updateEmployee = async (req, res) => {
    try {

        const employeeId = req.params.id;

        const {
            Name,
            Email,
            Role,
            Department_id,
            Joining_Date,
            password
        } = req.body;


        /*
        Password is optional while editing.

        If password is provided:
        update the password.

        If password is not provided:
        keep the existing password.
        */


        if (password) {

            const passwordHash =
                await bcrypt.hash(
                    password,
                    10
                );


            const result = await sql.query`
                UPDATE Employees
                SET
                    Name = ${Name},
                    Email = ${Email},
                    Role = ${Role},
                    Department_id = ${Department_id},
                    Joining_Date = ${Joining_Date},
                    Password_hash = ${passwordHash}
                OUTPUT INSERTED.*
                WHERE Employee_id = ${employeeId}
            `;


            if (
                result.recordset.length === 0
            ) {
                return res.status(404).json({
                    message: 'Employee not found'
                });
            }


            return res.json(
                result.recordset[0]
            );
        }


        // Update without changing password

        const result = await sql.query`
            UPDATE Employees
            SET
                Name = ${Name},
                Email = ${Email},
                Role = ${Role},
                Department_id = ${Department_id},
                Joining_Date = ${Joining_Date}
            OUTPUT INSERTED.*
            WHERE Employee_id = ${employeeId}
        `;


        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }


        res.json(
            result.recordset[0]
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Failed to update employee'
        });
    }
};


// Disable employee function for admin

const disableEmployee = async (req, res) => {
    try {

        const employeeId = req.params.id;

        const result = await sql.query`
            UPDATE Employees
            SET Is_Active = 0
            OUTPUT INSERTED.*
            WHERE Employee_id = ${employeeId}
        `;


        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }


        res.json({
            message:
                'Employee disabled successfully',

            employee:
                result.recordset[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                'Failed to disable employee'
        });
    }
};


// Reactivate employee function for admin

const reactivateEmployee = async (req, res) => {
    try {

        const employeeId = req.params.id;

        const result = await sql.query`
            UPDATE Employees
            SET Is_Active = 1
            OUTPUT INSERTED.*
            WHERE Employee_id = ${employeeId}
        `;


        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }


        res.json({
            message:
                'Employee reactivated successfully',

            employee:
                result.recordset[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                'Failed to reactivate employee'
        });
    }
};


module.exports = {
    getEmployees,
    getDepartments,
    addEmployee,
    updateEmployee,
    disableEmployee,
    reactivateEmployee
};