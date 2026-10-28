const { sql } = require('../config/db');

const getLocalDate = () => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, '0')}-${String(
        now.getDate()
    ).padStart(2, '0')}`;
};

const formatTime = (time) => {
    if (!time) {
        return null;
    }

    if (time instanceof Date) {
        return time.toISOString().substring(11, 19);
    }

    const str = String(time);
    return str.length >= 8 ? str.substring(0, 8) : str;
};

const formatDate = (date) => {
    if (!date) {
        return null;
    }

    if (date instanceof Date) {
        return date.toISOString().substring(0, 10);
    }

    return String(date).substring(0, 10);
};

const getDashboard = async (req, res) => {
    try {
        const requestedDate =
            req.query.date || getLocalDate();

        const search =
            req.query.search || '';

        /*
        =====================================================
        1. SUMMARY
        =====================================================
        */

        const summaryRequest = new sql.Request();

        summaryRequest.input(
            'Attendance_Date',
            sql.Date,
            requestedDate
        );

        const summaryResult = await summaryRequest.query(`
            SELECT
                COUNT(*) AS TotalEmployees,

                SUM(
                    CASE
                        WHEN A.Attendance_id IS NOT NULL
                        THEN 1
                        ELSE 0
                    END
                ) AS PresentToday,

                SUM(
                    CASE
                        WHEN A.In_time > '10:00:00'
                        THEN 1
                        ELSE 0
                    END
                ) AS LateToday,

                SUM(
                    CASE
                        WHEN A.Attendance_id IS NULL
                        THEN 1
                        ELSE 0
                    END
                ) AS AbsentToday

            FROM Employees E

            LEFT JOIN Attendance A
                ON E.Employee_id = A.Employee_id
                AND A.Attendance_Date = @Attendance_Date

            WHERE
                E.Is_Active = 1
                AND E.Joining_Date <= @Attendance_Date
        `);

        /*
        =====================================================
        2. TODAY'S ATTENDANCE
        =====================================================
        */

        const attendanceRequest = new sql.Request();

        attendanceRequest.input(
            'Attendance_Date',
            sql.Date,
            requestedDate
        );

        attendanceRequest.input(
            'Search',
            sql.VarChar(100),
            `%${search}%`
        );

        const attendanceResult =
            await attendanceRequest.query(`

                SELECT
                    A.Attendance_id,
                    A.Employee_id,
                    E.Employee_code,
                    E.Name,
                    E.Email,
                    E.Role,
                    A.Attendance_Date,
                    A.In_time,
                    A.Out_time,
                    A.Status,
                    D.Department_name,

                    CASE
                        WHEN A.In_time IS NOT NULL
                        AND A.Out_time IS NOT NULL
                        THEN
                            DATEDIFF(
                                MINUTE,
                                A.In_time,
                                A.Out_time
                            )
                        ELSE NULL
                    END AS WorkingMinutes

                FROM Attendance A

                INNER JOIN Employees E
                    ON A.Employee_id = E.Employee_id

                LEFT JOIN Departments D
                    ON E.Department_id = D.Department_id

                WHERE
                    A.Attendance_Date = @Attendance_Date

                    AND E.Is_Active = 1

                    AND (
                        E.Name LIKE @Search
                        OR E.Employee_code LIKE @Search
                        OR E.Email LIKE @Search
                    )

                ORDER BY
                    COALESCE(A.Out_time, A.In_time) DESC
            `);

        /*
        =====================================================
        3. LAST 7 DAYS TREND
        =====================================================
        */

        const trendRequest = new sql.Request();

        trendRequest.input(
            'Attendance_Date',
            sql.Date,
            requestedDate
        );

        const trendResult =
            await trendRequest.query(`

                SELECT

                    CONVERT(
                        VARCHAR(10),

                        DATEADD(
                            DAY,
                            -D.DayOffset,
                            CAST(@Attendance_Date AS DATE)
                        ),

                        105
                    ) AS DisplayDate,

                    CONVERT(
                        DATE,

                        DATEADD(
                            DAY,
                            -D.DayOffset,
                            CAST(@Attendance_Date AS DATE)
                        )

                    ) AS AttendanceDate,

                    COUNT(
                        CASE
                            WHEN A.Attendance_id IS NOT NULL
                            THEN 1
                        END
                    ) AS PresentCount,

                    COUNT(
                        CASE
                            WHEN A.In_time > '10:00:00'
                            THEN 1
                        END
                    ) AS LateCount,

                    COUNT(
                        CASE
                            WHEN A.Attendance_id IS NULL
                            THEN 1
                        END
                    ) AS AbsentCount

                FROM
                (
                    SELECT 0 AS DayOffset
                    UNION ALL SELECT 1
                    UNION ALL SELECT 2
                    UNION ALL SELECT 3
                    UNION ALL SELECT 4
                    UNION ALL SELECT 5
                    UNION ALL SELECT 6
                ) D

                CROSS JOIN Employees E

                LEFT JOIN Attendance A
                    ON E.Employee_id = A.Employee_id

                    AND A.Attendance_Date =

                        DATEADD(
                            DAY,
                            -D.DayOffset,
                            CAST(@Attendance_Date AS DATE)
                        )

                WHERE
                    E.Is_Active = 1

                    AND E.Joining_Date <=

                        DATEADD(
                            DAY,
                            -D.DayOffset,
                            CAST(@Attendance_Date AS DATE)
                        )

                GROUP BY
                    D.DayOffset,

                    DATEADD(
                        DAY,
                        -D.DayOffset,
                        CAST(@Attendance_Date AS DATE)
                    )

                ORDER BY
                    AttendanceDate ASC
            `);

        /*
        =====================================================
        4. RECENT ACTIVITY
        =====================================================
        */

        const activityRequest = new sql.Request();

        activityRequest.input(
            'Attendance_Date',
            sql.Date,
            requestedDate
        );

        const activityResult =
            await activityRequest.query(`

                SELECT TOP 10

                    A.Attendance_id,
                    E.Employee_code,
                    E.Name,
                    E.Role,
                    A.In_time,
                    A.Out_time,
                    A.Status

                FROM Attendance A

                INNER JOIN Employees E
                    ON A.Employee_id = E.Employee_id

                WHERE
                    A.Attendance_Date = @Attendance_Date

                ORDER BY
                    COALESCE(
                        A.Out_time,
                        A.In_time
                    ) DESC
            `);

        /*
        =====================================================
        5. FORMAT RESPONSE
        =====================================================
        */

        const summary =
            summaryResult.recordset[0];

        const attendance =
            attendanceResult.recordset.map(row => ({
                Attendance_id:
                    row.Attendance_id,

                Employee_id:
                    row.Employee_id,

                Employee_code:
                    row.Employee_code,

                Name:
                    row.Name,

                Email:
                    row.Email,

                Role:
                    row.Role,

                Department_name:
                    row.Department_name,

                Attendance_Date:
                    formatDate(row.Attendance_Date),

                In_time:
                    formatTime(row.In_time),

                Out_time:
                    formatTime(row.Out_time),

                Status:
                    row.Status,

                WorkingMinutes:
                    row.WorkingMinutes
            }));

        const trend =
            trendResult.recordset.map(row => {
                const dateStr = formatDate(row.AttendanceDate);
                let shortLabel = row.DisplayDate;

                if (dateStr) {
                    const [y, m, d] = dateStr.split('-');
                    const dt = new Date(Number(y), Number(m) - 1, Number(d));
                    shortLabel = dt.toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short'
                    });
                }

                const present = Number(row.PresentCount || 0);
                const late = Number(row.LateCount || 0);
                const absent = Number(row.AbsentCount || 0);
                const onTime = Math.max(present - late, 0);

                return {
                    date: dateStr,
                    label: shortLabel,
                    DisplayDate: shortLabel,
                    displayDate: row.DisplayDate,
                    present,
                    late,
                    onTime,
                    absent,
                    total: present + absent
                };
            });

        const recentActivity =
            activityResult.recordset.flatMap(row => {

                const activities = [];

                if (row.In_time) {

                    activities.push({
                        Employee_code:
                            row.Employee_code,

                        Name:
                            row.Name,

                        Role:
                            row.Role,

                        Type:
                            'CHECK_IN',

                        Time:
                            formatTime(row.In_time),

                        Status:
                            row.Status
                    });
                }

                if (row.Out_time) {

                    activities.push({
                        Employee_code:
                            row.Employee_code,

                        Name:
                            row.Name,

                        Role:
                            row.Role,

                        Type:
                            'CHECK_OUT',

                        Time:
                            formatTime(row.Out_time),

                        Status:
                            row.Status
                    });
                }

                return activities;
            });

        recentActivity.sort((a, b) =>
            b.Time.localeCompare(a.Time)
        );

        res.json({
            date: requestedDate,

            summary: {
                totalEmployees:
                    Number(summary.TotalEmployees || 0),

                presentToday:
                    Number(summary.PresentToday || 0),

                lateToday:
                    Number(summary.LateToday || 0),

                absentToday:
                    Number(summary.AbsentToday || 0)
            },

            attendance,

            trend,

            recentActivity:
                recentActivity.slice(0, 10)
        });

    } catch (error) {

        console.error(
            'Dashboard error:',
            error
        );

        res.status(500).json({
            message:
                'Failed to load dashboard data'
        });
    }
};

module.exports = {
    getDashboard
};