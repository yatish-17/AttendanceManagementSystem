const { sql } = require('../config/db');
const formatTime = (value) => {
    if (!value) {
        return null;
    }

    return value.toISOString().substring(11, 19);
};
const getAttendance = async (req, res) => {
    try {
        const { search, date, status } = req.query;

        let query = `
            SELECT
                A.Attendance_id,
                E.Employee_id,
                E.Employee_code,
                E.Name,
                E.Email,
                E.Role,
                A.Attendance_Date,
                A.In_time,
                A.Out_time,
                A.Status
            FROM Attendance A
            INNER JOIN Employees E
                ON A.Employee_id = E.Employee_id
            WHERE 1 = 1
        `;

        const request = new sql.Request();
        if (req.user.Role !== 'Admin') {
    query += `
        AND A.Employee_id = @Employee_id
    `;

    request.input(
        'Employee_id',
        sql.Int,
        req.user.Employee_id
    );
}

        if (search) {
            query += `
                AND (
                    E.Name LIKE @search
                    OR E.Employee_code LIKE @search
                    OR E.Email LIKE @search
                )
            `;

            request.input('search', sql.VarChar, `%${search}%`);
        }

        if (date) {
            query += `
                AND A.Attendance_Date = @date
            `;

            request.input('date', sql.Date, date);
        }

        if (status) {
            query += `
                AND A.Status = @status
            `;

            request.input('status', sql.VarChar, status);
        }

        query += `
            ORDER BY A.Attendance_Date DESC, E.Employee_id
        `;

          const result = await request.query(query);

const attendance = result.recordset.map(record => ({
    ...record,
    In_time: formatTime(record.In_time),
    Out_time: formatTime(record.Out_time)
}));

res.json(attendance);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to fetch attendance'
        });
    }
};


const getAbsentEmployees = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                message: 'Date is required'
            });
        }

        const request = new sql.Request();

        request.input('date', sql.Date, date);

        const result = await request.query(`
           SELECT
    E.Employee_id,
    E.Employee_code,
    E.Name,
    E.Email,
    E.Role,
    E.Department_id
FROM Employees E
LEFT JOIN Attendance A
    ON E.Employee_id = A.Employee_id
    AND A.Attendance_Date = @date
WHERE E.Is_Active = 1
    AND E.Joining_Date <= @date
    AND A.Attendance_id IS NULL
ORDER BY E.Employee_id;
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to fetch absent employees'
        });
    }
};

const getLateEmployees = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                message: 'Date is required'
            });
        }

        const request = new sql.Request();

        request.input('date', sql.Date, date);

        const result = await request.query(`
            SELECT
                A.Attendance_id,
                E.Employee_id,
                E.Employee_code,
                E.Name,
                A.Attendance_Date,
                A.In_time,
                A.Out_time,
                A.Status
            FROM Attendance A
            INNER JOIN Employees E
                ON A.Employee_id = E.Employee_id
            WHERE A.Attendance_Date = @date
                AND A.In_time > '10:00:00'
                AND E.Is_Active = 1
            ORDER BY A.In_time;
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to fetch late employees'
        });
    }
};


const getEarlyLeaveEmployees = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                message: 'Date is required'
            });
        }

        const request = new sql.Request();

        request.input('date', sql.Date, date);

        const result = await request.query(`
            SELECT
                A.Attendance_id,
                E.Employee_id,
                E.Employee_code,
                E.Name,
                A.Attendance_Date,
                A.In_time,
                A.Out_time,
                A.Status
            FROM Attendance A
            INNER JOIN Employees E
                ON A.Employee_id = E.Employee_id
            WHERE A.Attendance_Date = @date
                AND A.Out_time < '18:00:00'
                AND A.Out_time IS NOT NULL
                AND E.Is_Active = 1
            ORDER BY A.Out_time;
        `);

        res.json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to fetch early leave employees'
        });
    }
};

const checkIn = async (req, res) => {
    try {
       const Employee_id = req.user.Employee_id;

        // Get employee
        const employeeRequest = new sql.Request();

        employeeRequest.input(
            'Employee_id',
            sql.Int,
            Employee_id
        );

        const employeeResult = await employeeRequest.query(`
            SELECT
                Employee_id,
                Name,
                Is_Active
            FROM Employees
            WHERE Employee_id = @Employee_id
        `);

        if (employeeResult.recordset.length === 0) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        const employee = employeeResult.recordset[0];

        // Check whether employee is active
        if (!employee.Is_Active) {
            return res.status(403).json({
                message: 'Employee account is disabled'
            });
        }

        // Get current server date and time
          const now = new Date();

const attendanceDate =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const currentTime =
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Check whether employee already checked in today
        const attendanceRequest = new sql.Request();

        attendanceRequest.input(
            'Employee_id',
            sql.Int,
            Employee_id
        );

        attendanceRequest.input(
            'Attendance_Date',
            sql.Date,
            attendanceDate
        );

        const existingAttendance =
            await attendanceRequest.query(`
                SELECT Attendance_id
                FROM Attendance
                WHERE Employee_id = @Employee_id
                  AND Attendance_Date = @Attendance_Date
            `);

        if (existingAttendance.recordset.length > 0) {
            return res.status(400).json({
                message: 'Employee has already checked in today'
            });
        }

        // Determine status
        const status =
            currentTime > '10:00:00'
                ? 'Late'
                : 'Present';

        // Insert attendance
        const insertRequest = new sql.Request();

        insertRequest.input(
            'Employee_id',
            sql.Int,
            Employee_id
        );

        insertRequest.input(
            'Attendance_Date',
            sql.Date,
            attendanceDate
        );

        insertRequest.input(
            'In_time',
            sql.VarChar,
            currentTime
        );

        insertRequest.input(
            'Status',
            sql.VarChar,
            status
        );

        const result = await insertRequest.query(`
            INSERT INTO Attendance
            (
                Employee_id,
                Attendance_Date,
                In_time,
                Status
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @Employee_id,
                @Attendance_Date,
                CAST(@In_time AS TIME),
                @Status
            )
        `);

       const attendance = result.recordset[0];

res.status(201).json({
    message: 'Check-in successful',
    employee: employee.Name,
    checkInTime: formatTime(attendance.In_time),
    status: attendance.Status,
    attendance: {
        Attendance_id: attendance.Attendance_id,
        Employee_id: attendance.Employee_id,
        Attendance_Date: attendance.Attendance_Date,
        In_time: formatTime(attendance.In_time),
        Out_time: formatTime(attendance.Out_time),
        Status: attendance.Status
    }
});
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to check in'
        });
    }
};

const checkOut = async (req, res) => {
    try {
        const Employee_id = req.user.Employee_id;

        // Get current server date and time
       const now = new Date();

const attendanceDate =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const currentTime =
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;




        // Find today's attendance record
        const request = new sql.Request();

        request.input(
            'Employee_id',
            sql.Int,
            Employee_id
        );

        request.input(
            'Attendance_Date',
            sql.Date,
            attendanceDate
        );

        const result = await request.query(`
            SELECT
                A.Attendance_id,
                A.Employee_id,
                A.In_time,
                A.Out_time,
                A.Status,
                E.Name
            FROM Attendance A
            INNER JOIN Employees E
                ON A.Employee_id = E.Employee_id
            WHERE A.Employee_id = @Employee_id
              AND A.Attendance_Date = @Attendance_Date
        `);

        // Employee has not checked in
        if (result.recordset.length === 0) {
            return res.status(400).json({
                message: 'Employee has not checked in today'
            });
        }

        const attendance = result.recordset[0];

        // Already checked out
        if (attendance.Out_time !== null) {
            return res.status(400).json({
                message: 'Employee has already checked out today'
            });
        }

        // Determine final status
        let finalStatus = attendance.Status;

        if (currentTime < '18:00:00') {
            finalStatus = 'Early Leave';
        }

        // Update checkout time
        const updateRequest = new sql.Request();

        updateRequest.input(
            'Attendance_id',
            sql.Int,
            attendance.Attendance_id
        );

        updateRequest.input(
            'Out_time',
            sql.VarChar,
            currentTime
        );

        updateRequest.input(
            'Status',
            sql.VarChar,
            finalStatus
        );

        const updateResult = await updateRequest.query(`
            UPDATE Attendance
            SET
                Out_time = CAST(@Out_time AS TIME),
                Status = @Status
            OUTPUT INSERTED.*
            WHERE Attendance_id = @Attendance_id
        `);

        const updatedAttendance = updateResult.recordset[0];

res.json({
    message: 'Check-out successful',
    employee: attendance.Name,
    checkOutTime: formatTime(updatedAttendance.Out_time),
    status: updatedAttendance.Status,
    attendance: {
        Attendance_id: updatedAttendance.Attendance_id,
        Employee_id: updatedAttendance.Employee_id,
        Attendance_Date: updatedAttendance.Attendance_Date,
        In_time: formatTime(updatedAttendance.In_time),
        Out_time: formatTime(updatedAttendance.Out_time),
        Status: updatedAttendance.Status
    }
});
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Failed to check out'
        });
    }
};

module.exports = {
    getAttendance,
    getAbsentEmployees,
    getLateEmployees,
    getEarlyLeaveEmployees,
    checkIn,
     checkOut
};