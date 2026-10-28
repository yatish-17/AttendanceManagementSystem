const bcrypt = require('bcryptjs');

const { sql, connectDB } = require('../src/config/db');

require('dotenv').config({
    path: require('path').resolve(__dirname, '../.env')
});

const seedPasswords = async () => {
    const employeeIds = (process.env.SEED_EMPLOYEE_IDS || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map(Number);
    const hasInvalidEmployeeIds = employeeIds.length === 0 ||
        employeeIds.some((employeeId) => !Number.isInteger(employeeId) || employeeId < 1) ||
        new Set(employeeIds).size !== employeeIds.length;

    if (hasInvalidEmployeeIds) {
        throw new Error(
            'Set SEED_EMPLOYEE_IDS to a comma-separated list of unique positive employee IDs in backend/.env.'
        );
    }

    const employees = employeeIds.map((employeeId) => ({
        Employee_id: employeeId,
        password: process.env[`SEED_PASSWORD_EMPLOYEE_${employeeId}`]
    }));
    const missingPassword = employees.find(
        (employee) => typeof employee.password !== 'string' ||
            employee.password.length < 12
    );

    if (missingPassword) {
        throw new Error(
            `Set SEED_PASSWORD_EMPLOYEE_${missingPassword.Employee_id} to a unique password of at least 12 characters in backend/.env.`
        );
    }

    let connected = false;
    try {
        await connectDB();
        connected = true;

        for (const employee of employees) {
            const hashedPassword = await bcrypt.hash(
                employee.password,
                10
            );

            const request = new sql.Request();

            request.input(
                'Employee_id',
                sql.Int,
                employee.Employee_id
            );

            request.input(
                'Password_hash',
                sql.VarChar(255),
                hashedPassword
            );

            const result = await request.query(`
                UPDATE Employees
                SET Password_hash = @Password_hash
                WHERE Employee_id = @Employee_id
            `);

            if (result.rowsAffected[0] !== 1) {
                throw new Error(
                    `No employee was updated for employee ID ${employee.Employee_id}.`
                );
            }
        }

    } catch (error) {
        throw new Error(`Password seeding failed: ${error.message}`, {
            cause: error
        });
    } finally {
        if (connected) {
            await sql.close();
        }
    }
};

seedPasswords()
    .then(() => {
        console.log('Password hashes updated successfully.');
    })
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    });