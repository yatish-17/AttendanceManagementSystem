import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAllAttendance,
    getDepartments,
    getEmployees
} from '../services/api';
import './AdminReports.css';

const COLORS = {
    Present: '#0cbd83',
    Absent: '#ff484d',
    Late: '#8e41ff',
    'Early Leave': '#ff9d24',
    Incomplete: '#6886b4'
};

const AVATAR_COLORS = ['#1156b4', '#0878e8', '#00a879', '#7e42e8', '#e07a18'];

const dateToInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getMonthRange = (date = new Date()) => ({
    from: dateToInput(new Date(date.getFullYear(), date.getMonth(), 1)),
    to: dateToInput(new Date(date.getFullYear(), date.getMonth() + 1, 0))
});

const dateOnly = (value) => String(value || '').slice(0, 10);
const departmentLabel = (department) => {
    const value = typeof department === 'object' && department !== null
        ? department.Department_name ?? department.name
        : department;
    return typeof value === 'string' && value.trim() ? value : 'Unassigned';
};

const parseDate = (value) => {
    const [year, month, day] = dateOnly(value).split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

const formatDate = (value, options = { day: '2-digit', month: 'short', year: 'numeric' }) => (
    parseDate(value)?.toLocaleDateString('en-GB', options) || '—'
);

const formatRangeDate = (value) => {
    const date = parseDate(value);
    return date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
};

const countWeekdays = (from, to) => {
    const start = parseDate(from);
    const end = parseDate(to);
    if (!start || !end || start > end) return 0;

    let count = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
        if (cursor.getDay() !== 0 && cursor.getDay() !== 6) count += 1;
        cursor.setDate(cursor.getDate() + 1);
    }
    return count;
};

const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

function Icon({ type, size = 18 }) {
    const icons = {
        dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
        employees: <><circle cx="9" cy="8" r="3" /><path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5a3 3 0 0 1 0 7M18 15c2 .8 3 2.6 3 5" /></>,
        attendance: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h2M14 14h2" /></>,
        reports: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
        settings: <><circle cx="12" cy="12" r="3" /><path d="m19 15 2 2-3 3-2-2a6 6 0 0 1-2 .8V22h-4v-3.2a6 6 0 0 1-2-.8l-2 2-3-3 2-2a6 6 0 0 1-.8-2H1v-4h3.2A6 6 0 0 1 5 7l-2-2 3-3 2 2a6 6 0 0 1 2-.8V0h4v3.2a6 6 0 0 1 2 .8l2-2 3 3-2 2a6 6 0 0 1 .8 2H23v4h-3.2a6 6 0 0 1-.8 2Z" /></>,
        logout: <><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-5" /></>,
        search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
        bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
        calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
        download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
        trend: <><path d="M3 19V5M3 19h18M5 9l4 4 3-2 4 3 4-6" /></>,
        group: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6M15 16c3 .2 5 2 5 5" /></>,
        chart: <><path d="M4 20V5M4 20h16M7 15l4-4 3 2 5-7" /></>,
        history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" /></>,
        dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
        document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>
    };

    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {icons[type] || icons.reports}
        </svg>
    );
}

function AdminReports() {
    const navigate = useNavigate();
    const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
    const today = dateToInput(new Date());
    const initialRange = getMonthRange();

    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('detailed');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [trendInterval, setTrendInterval] = useState('Daily');
    const [departmentPeriod, setDepartmentPeriod] = useState('This Month');
    const [draftFilters, setDraftFilters] = useState({
        ...initialRange,
        search: '',
        department: 'all',
        status: 'all'
    });
    const [filters, setFilters] = useState({
        ...initialRange,
        search: '',
        department: 'all',
        status: 'all'
    });
    const [filterError, setFilterError] = useState('');
    const [exportHistory, setExportHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('attendanceReportExports') || '[]');
        } catch (storageError) {
            console.error('Unable to read report export history:', storageError);
            return [];
        }
    });
    const [selectedReportRow, setSelectedReportRow] = useState(null);

    const loadData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError('');

            const [attendanceResult, employeeResult, departmentResult] = await Promise.all([
                getAllAttendance(),
                getEmployees(),
                getDepartments()
            ]);

            if (!attendanceResult.response.ok) {
                throw new Error(attendanceResult.data.message || 'Unable to load attendance records.');
            }
            if (!employeeResult.response.ok) {
                throw new Error(employeeResult.data.message || 'Unable to load employees.');
            }
            if (!departmentResult.response.ok) {
                throw new Error(departmentResult.data.message || 'Unable to load departments.');
            }

            setAttendance(attendanceResult.data);
            setEmployees(employeeResult.data);
            setDepartments(departmentResult.data);
        } catch (loadError) {
            console.error('Report data loading error:', loadError);
            setError(loadError.message || 'Unable to connect to the server.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const initialLoadId = window.setTimeout(() => loadData(), 0);
        const refreshId = window.setInterval(() => {
            if (document.visibilityState === 'visible') loadData(true);
        }, 60_000);
        return () => {
            window.clearTimeout(initialLoadId);
            window.clearInterval(refreshId);
        };
    }, [loadData]);

    useEffect(() => {
        try {
            localStorage.setItem('attendanceReportExports', JSON.stringify(exportHistory));
        } catch (storageError) {
            console.error('Unable to save report export history:', storageError);
        }
    }, [exportHistory]);

    const employeeById = useMemo(
        () => new Map(employees.map((employee) => [String(employee.Employee_id), employee])),
        [employees]
    );
    const departmentById = useMemo(
        () => new Map(departments.map((department) => [
            String(department.Department_id),
            departmentLabel(department.Department_name)
        ])),
        [departments]
    );
    const activeEmployees = useMemo(
        () => employees.filter((employee) => employee.Is_Active),
        [employees]
    );

    const allReportRows = useMemo(() => {
        const recordGroups = new Map();

        attendance.forEach((record) => {
            const employee = employeeById.get(String(record.Employee_id));
            if (!employee || !employee.Is_Active) return;
            const recordDate = dateOnly(record.Attendance_Date);
            if (!recordDate || !record.Status) return;

            const key = `${record.Employee_id}|${recordDate}`;
            if (!recordGroups.has(key)) {
                recordGroups.set(key, {
                    employeeId: record.Employee_id,
                    employeeName: record.Name || employee.Name || 'Unknown employee',
                    employeeCode: record.Employee_code || employee.Employee_code || '—',
                    departmentId: employee.Department_id,
                    department: departmentLabel(departmentById.get(String(employee.Department_id))),
                    recordDate,
                    statuses: new Set(),
                    records: 0
                });
            }
            const group = recordGroups.get(key);
            group.statuses.add(record.Status);
            group.records += 1;
        });

        return activeEmployees.map((employee) => {
            const joiningDate = dateOnly(employee.Joining_Date) || filters.from;
            const start = joiningDate > filters.from ? joiningDate : filters.from;
            const end = filters.to < today ? filters.to : today;
            const eligibleDays = countWeekdays(start, end);
            const employeeRows = [...recordGroups.values()].filter(
                (row) => String(row.employeeId) === String(employee.Employee_id) &&
                    row.recordDate >= filters.from &&
                    row.recordDate <= filters.to
            );
            const present = employeeRows.filter((row) => row.statuses.has('Present')).length;
            const late = employeeRows.filter((row) => row.statuses.has('Late')).length;
            const earlyLeave = employeeRows.filter((row) => row.statuses.has('Early Leave')).length;
            const incomplete = employeeRows.filter((row) => row.statuses.has('Incomplete')).length;
            const marked = employeeRows.length;
            const absent = Math.max(0, eligibleDays - marked);
            const attendancePercent = eligibleDays
                ? Math.min(100, Math.round((marked / eligibleDays) * 100))
                : 0;

            return {
                employeeId: employee.Employee_id,
                employeeName: employee.Name || 'Unknown employee',
                employeeCode: employee.Employee_code || '—',
                departmentId: employee.Department_id,
                department: departmentById.get(String(employee.Department_id)) || 'Unassigned',
                joiningDate,
                totalDays: eligibleDays,
                present,
                absent,
                late,
                earlyLeave,
                incomplete,
                attendancePercent
            };
        });
    }, [activeEmployees, attendance, departmentById, employeeById, filters.from, filters.to, today]);

    const reportRows = useMemo(() => {
        const search = filters.search.trim().toLowerCase();
        return allReportRows.filter((row) => {
            const matchesSearch = !search ||
                row.employeeName.toLowerCase().includes(search) ||
                row.employeeCode.toLowerCase().includes(search);
            const matchesDepartment = filters.department === 'all' ||
                String(row.departmentId) === filters.department;
            const matchesStatus = filters.status === 'all' ||
                row[filters.status] > 0;
            return matchesSearch && matchesDepartment && matchesStatus;
        }).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    }, [allReportRows, filters]);

    const departmentReportRows = useMemo(() => departments.map((department) => {
        const members = reportRows.filter(
            (row) => String(row.departmentId) === String(department.Department_id)
        );
        const eligibleDays = members.reduce((sum, row) => sum + row.totalDays, 0);
        const attendedDays = members.reduce(
            (sum, row) => sum + row.present + row.late + row.earlyLeave + row.incomplete,
            0
        );
        return {
            departmentId: department.Department_id,
            name: departmentLabel(department.Department_name),
            employees: members.length,
            percent: eligibleDays ? Math.min(100, Math.round((attendedDays / eligibleDays) * 100)) : 0,
            present: members.reduce((sum, row) => sum + row.present, 0),
            late: members.reduce((sum, row) => sum + row.late, 0)
        };
    }).filter((department) => department.employees > 0), [departments, reportRows]);

    const detailedAttendance = useMemo(
        () => attendance.filter((row) => dateOnly(row.Attendance_Date) >= filters.from && dateOnly(row.Attendance_Date) <= filters.to),
        [attendance, filters.from, filters.to]
    );

    const reportTotals = useMemo(() => reportRows.reduce((totals, row) => ({
        employees: totals.employees + 1,
        days: totals.days + row.totalDays,
        present: totals.present + row.present,
        absent: totals.absent + row.absent,
        late: totals.late + row.late,
        earlyLeave: totals.earlyLeave + row.earlyLeave,
        incomplete: totals.incomplete + row.incomplete
    }), {
        employees: 0, days: 0, present: 0, absent: 0, late: 0, earlyLeave: 0, incomplete: 0
    }), [reportRows]);

    const totalStatusCount = reportTotals.present + reportTotals.absent + reportTotals.late + reportTotals.earlyLeave;
    const statusDistribution = [
        { label: 'Present', count: reportTotals.present, color: COLORS.Present },
        { label: 'Absent', count: reportTotals.absent, color: COLORS.Absent },
        { label: 'Late', count: reportTotals.late, color: COLORS.Late },
        { label: 'Early Leave', count: reportTotals.earlyLeave, color: COLORS['Early Leave'] }
    ];

    const departmentSummaries = useMemo(() => {
        const periodEnd = parseDate(today);
        let periodStart = new Date(periodEnd);
        if (departmentPeriod === 'This Month') {
            periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
        } else if (departmentPeriod === 'This Week') {
            periodStart.setDate(periodStart.getDate() - ((periodStart.getDay() + 6) % 7));
        } else {
            periodStart = new Date(periodEnd.getFullYear(), 0, 1);
        }
        const startKey = dateToInput(periodStart);
        const endKey = dateToInput(periodEnd);

        return departments.map((department) => {
            const members = activeEmployees.filter(
                (employee) => String(employee.Department_id) === String(department.Department_id)
            );
            const eligibleDays = members.reduce((sum, employee) => {
                const joined = dateOnly(employee.Joining_Date) || startKey;
                return sum + countWeekdays(joined > startKey ? joined : startKey, endKey);
            }, 0);
            const departmentRecords = attendance.filter((record) => {
                const employee = employeeById.get(String(record.Employee_id));
                const recordDate = dateOnly(record.Attendance_Date);
                return employee?.Is_Active &&
                    String(employee.Department_id) === String(department.Department_id) &&
                    recordDate >= startKey &&
                    recordDate <= endKey;
            });
            const markedDays = new Set(departmentRecords.map(
                (record) => `${record.Employee_id}|${dateOnly(record.Attendance_Date)}`
            )).size;

            return {
                departmentId: department.Department_id,
                name: departmentLabel(department.Department_name),
                employees: members.length,
                percent: eligibleDays ? Math.min(100, Math.round((markedDays / eligibleDays) * 100)) : 0,
                present: departmentRecords.filter((record) => record.Status === 'Present').length,
                late: departmentRecords.filter((record) => record.Status === 'Late').length
            };
        }).filter((department) => department.employees > 0);
    }, [activeEmployees, attendance, departmentPeriod, departments, employeeById, today]);

    const trendData = useMemo(() => {
        const startDate = parseDate(filters.from);
        const endDate = parseDate(filters.to);
        if (!startDate || !endDate || startDate > endDate) return [];

        const data = new Map();
        const cursor = new Date(startDate);
        while (cursor <= endDate) {
            const key = dateToInput(cursor);
            data.set(key, { key, present: 0, absent: 0, late: 0, earlyLeave: 0 });
            cursor.setDate(cursor.getDate() + 1);
        }

        reportRows.forEach((employee) => {
            const employeeStart = employee.joiningDate > filters.from ? employee.joiningDate : filters.from;
            const eligibleCursor = parseDate(employeeStart);
            const periodEnd = parseDate(filters.to);
            const lastEligibleDay = periodEnd && periodEnd < parseDate(today) ? periodEnd : parseDate(today);
            if (eligibleCursor && lastEligibleDay) {
                while (eligibleCursor <= lastEligibleDay) {
                    if (eligibleCursor.getDay() !== 0 && eligibleCursor.getDay() !== 6) {
                        const bucket = data.get(dateToInput(eligibleCursor));
                        if (bucket) bucket.absent += 1;
                    }
                    eligibleCursor.setDate(eligibleCursor.getDate() + 1);
                }
            }
        });

        detailedAttendance.forEach((record) => {
            const bucket = data.get(dateOnly(record.Attendance_Date));
            if (!bucket) return;
            if (record.Status === 'Present') bucket.present += 1;
            if (record.Status === 'Late') bucket.late += 1;
            if (record.Status === 'Early Leave') bucket.earlyLeave += 1;
            if (record.Status === 'Incomplete') bucket.earlyLeave += 1;
        });

        for (const bucket of data.values()) {
            bucket.absent = Math.max(0, bucket.absent - bucket.present - bucket.late - bucket.earlyLeave);
        }

        const points = [...data.values()];
        if (trendInterval === 'Weekly') {
            const weekly = new Map();
            points.forEach((point) => {
                const date = parseDate(point.key);
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7));
                const key = dateToInput(weekStart);
                const bucket = weekly.get(key) || { ...point, key, label: `Week of ${formatDate(key, { day: '2-digit', month: 'short' })}` };
                ['present', 'absent', 'late', 'earlyLeave'].forEach((status) => { bucket[status] += point[status]; });
                weekly.set(key, bucket);
            });
            return [...weekly.values()];
        }
        if (trendInterval === 'Monthly') {
            const monthly = new Map();
            points.forEach((point) => {
                const key = point.key.slice(0, 7);
                const bucket = monthly.get(key) || { key, label: formatDate(`${key}-01`, { month: 'short', year: '2-digit' }), present: 0, absent: 0, late: 0, earlyLeave: 0 };
                ['present', 'absent', 'late', 'earlyLeave'].forEach((status) => { bucket[status] += point[status]; });
                monthly.set(key, bucket);
            });
            return [...monthly.values()];
        }
        return points.map((point) => ({
            ...point,
            label: formatDate(point.key, { day: '2-digit', month: 'short' })
        }));
    }, [detailedAttendance, filters.from, filters.to, reportRows, today, trendInterval]);

    const trendMaximum = Math.max(5, ...trendData.flatMap((point) => [point.present, point.absent, point.late, point.earlyLeave]));
    const trendGridMax = Math.ceil(trendMaximum / 5) * 5;
    const monthLabel = `${formatRangeDate(filters.from)}  -  ${formatRangeDate(filters.to)}`;

    const applyFilters = () => {
        if (draftFilters.from > draftFilters.to) {
            setFilterError('The start date must be on or before the end date.');
            return;
        }
        setFilterError('');
        setFilters(draftFilters);
        setPage(1);
    };

    const resetFilters = () => {
        const cleared = { ...getMonthRange(), search: '', department: 'all', status: 'all' };
        setDraftFilters(cleared);
        setFilters(cleared);
        setFilterError('');
        setPage(1);
    };

    const makeCsv = () => {
        if (activeTab === 'department') {
            return [
                ['Department', 'Employees', 'Present', 'Late', 'Attendance %'],
                ...departmentReportRows.map((row) => [row.name, row.employees, row.present, row.late, `${row.percent}%`])
            ].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
        }
        if (activeTab === 'monthly') {
            const totalDays = reportRows.reduce((sum, row) => sum + row.totalDays, 0);
            const present = reportRows.reduce((sum, row) => sum + row.present, 0);
            const absent = reportRows.reduce((sum, row) => sum + row.absent, 0);
            const late = reportRows.reduce((sum, row) => sum + row.late, 0);
            return [
                ['Metric', 'Value'],
                ['Report period', `${filters.from} - ${filters.to}`],
                ['Employees', reportRows.length],
                ['Present days', present],
                ['Absent days', absent],
                ['Late arrivals', late],
                ['Attendance rate', `${totalDays ? Math.round(((present + late) / totalDays) * 100) : 0}%`]
            ].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
        }
        const heading = ['Employee', 'Employee code', 'Department', 'Total days', 'Present', 'Absent', 'Late', 'Early leave', 'Attendance %'];
        return [heading, ...reportRows.map((row) => [
            row.employeeName, row.employeeCode, row.department, row.totalDays,
            row.present, row.absent, row.late, row.earlyLeave, `${row.attendancePercent}%`
        ])].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    };

    const generateReport = () => {
        const csv = makeCsv();
        const blobUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        const reportType = activeTab === 'history' ? 'detailed' : activeTab;
        const fileName = `attendance-${reportType}-report-${filters.from}-to-${filters.to}.csv`;
        link.href = blobUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(blobUrl);
        setExportHistory((previous) => [
            {
                fileName,
                generatedAt: new Date().toISOString(),
                records: reportType === 'department' ? departmentReportRows.length : reportRows.length,
                from: filters.from,
                to: filters.to
            },
            ...previous
        ].slice(0, 30));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
        navigate('/login');
    };

    const totalPages = Math.max(1, Math.ceil(reportRows.length / pageSize));
    const pageRows = reportRows.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="reports-page">
            <aside className="reports-sidebar">
                <div className="reports-brand">
                    <div className="reports-brand-icon"><Icon type="calendar" size={25} /></div>
                    <div><strong>ATTENDANCE</strong><span>MANAGEMENT</span></div>
                </div>
                <nav className="reports-nav" aria-label="Admin navigation">
                    {[
                        ['dashboard', 'Dashboard', '/admin/dashboard'],
                        ['employees', 'Employees', '/admin/employees'],
                        ['attendance', 'Attendance', '/admin/attendance'],
                        ['reports', 'Reports', '/admin/reports'],
                        ['settings', 'Settings', '/admin/settings']
                    ].map(([icon, label, path]) => (
                        <button className={`reports-nav-item${label === 'Reports' ? ' active' : ''}`} key={label} onClick={() => navigate(path)}>
                            <Icon type={icon} size={21} /><span>{label}</span>
                        </button>
                    ))}
                </nav>
                <div className="reports-side-bottom">
                    <div className="reports-side-user">
                        <div className="reports-avatar">{employeeData.Name?.charAt(0).toUpperCase() || 'A'}</div>
                        <div><strong>{employeeData.Name || 'Admin'}</strong><span>System Administrator</span></div>
                    </div>
                    <button className="reports-logout" onClick={handleLogout}><Icon type="logout" size={21} /><span>Logout</span></button>
                </div>
            </aside>

            <main className="reports-main">
                <header className="reports-topbar">
                    <label className="reports-global-search">
                        <Icon type="search" size={19} />
                        <input
                            type="search"
                            placeholder="Search employees, department..."
                            value={draftFilters.search}
                            onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })}
                            onKeyDown={(event) => { if (event.key === 'Enter') applyFilters(); }}
                            aria-label="Search employees and departments"
                        />
                    </label>
                    <div className="reports-top-actions">
                        <button className={`reports-notification${refreshing ? ' refreshing' : ''}`} aria-label="Refresh report data" onClick={() => loadData(true)}><Icon type="bell" size={20} /><span>5</span></button>
                        <span className="reports-top-avatar">{employeeData.Name?.charAt(0).toUpperCase() || 'A'}</span>
                        <strong>{employeeData.Name || 'Admin'}</strong><span className="reports-chevron">⌄</span>
                    </div>
                </header>

                <div className="reports-content">
                    <section className="reports-hero">
                        <div className="reports-heading">
                            <h1>Reports</h1>
                            <p>Analyze attendance data and generate detailed reports</p>
                        </div>
                        <div className="reports-hero-illustration" aria-hidden="true">
                            <span className="hero-art-leaf leaf-one" />
                            <span className="hero-art-leaf leaf-two" />
                            <span className="hero-art-card"><i /><i /><i /><b /></span>
                            <span className="hero-art-pie" />
                            <span className="hero-art-sparkles">· · ·</span>
                        </div>
                        <div className="reports-hero-actions">
                            <div className="reports-range-pill"><Icon type="calendar" size={16} /><span>{monthLabel}</span><span className="range-caret">⌄</span></div>
                            <button className="generate-report-button" onClick={generateReport} disabled={loading || Boolean(error)}><Icon type="document" size={16} />Generate Report</button>
                        </div>
                    </section>

                    <section className="reports-analytics">
                        <article className="reports-chart-card trend-card">
                            <div className="reports-card-title">
                                <span className="reports-chart-icon"><Icon type="trend" size={19} /></span>
                                <div><h2>Attendance Trend</h2><p>Daily attendance for the selected period</p></div>
                                <select aria-label="Attendance trend interval" value={trendInterval} onChange={(event) => setTrendInterval(event.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option></select>
                            </div>
                            {error ? <ChartError message={error} /> : loading ? <ChartLoading /> : <TrendChart data={trendData} maximum={trendGridMax} />}
                            <div className="reports-chart-legend">{['Present', 'Absent', 'Late', 'Early Leave'].map((status) => <span key={status}><i style={{ backgroundColor: COLORS[status] }} />{status}</span>)}</div>
                        </article>

                        <article className="reports-chart-card department-card">
                            <div className="reports-card-title">
                                <span className="reports-chart-icon"><Icon type="group" size={19} /></span>
                                <div><h2>Department-wise Attendance</h2><p>Attendance consistency by department</p></div>
                                <select aria-label="Department report period" value={departmentPeriod} onChange={(event) => setDepartmentPeriod(event.target.value)}><option>This Month</option><option>This Week</option><option>This Year</option></select>
                            </div>
                            {error ? <ChartError message={error} /> : loading ? <ChartLoading /> : <DepartmentChart departments={departmentSummaries} />}
                        </article>

                        <article className="reports-chart-card status-card">
                            <div className="reports-card-title">
                                <span className="reports-chart-icon"><Icon type="chart" size={19} /></span>
                                <div><h2>Attendance Status Distribution</h2><p>Overall status for selected period</p></div>
                            </div>
                            {error ? <ChartError message={error} /> : loading ? <ChartLoading /> : <StatusChart data={statusDistribution} total={totalStatusCount} />}
                        </article>
                    </section>

                    <section className="reports-workspace">
                        <div className="reports-tabs">
                            <div className="reports-tab-list" role="tablist" aria-label="Report views">
                                {[
                                    ['detailed', 'Detailed Report', 'reports'],
                                    ['department', 'Department Report', 'chart'],
                                    ['employee', 'Employee Report', 'employees'],
                                    ['monthly', 'Monthly Summary', 'calendar'],
                                    ['history', 'Export History', 'history']
                                ].map(([id, label, icon]) => (
                                    <button className={`reports-tab${activeTab === id ? ' active' : ''}`} role="tab" aria-selected={activeTab === id} key={id} onClick={() => { setActiveTab(id); setPage(1); }}>
                                        <Icon type={icon} size={16} />{label}
                                    </button>
                                ))}
                            </div>
                            <button className="reports-export-button" onClick={generateReport} disabled={loading || Boolean(error)}><Icon type="download" size={15} />Export <span>⌄</span></button>
                        </div>

                        <div className="reports-filters">
                            <label className="reports-filter-search"><Icon type="search" size={17} /><input placeholder="Search by name, employee code..." value={draftFilters.search} onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })} /></label>
                            <label className="reports-filter-date"><Icon type="calendar" size={16} /><input type="date" aria-label="Report start date" value={draftFilters.from} onChange={(event) => setDraftFilters({ ...draftFilters, from: event.target.value })} /></label>
                            <label className="reports-filter-date"><Icon type="calendar" size={16} /><input type="date" aria-label="Report end date" value={draftFilters.to} onChange={(event) => setDraftFilters({ ...draftFilters, to: event.target.value })} /></label>
                            <select aria-label="Filter report by department" value={draftFilters.department} onChange={(event) => setDraftFilters({ ...draftFilters, department: event.target.value })}><option value="all">All Departments</option>{departments.map((department) => <option value={department.Department_id} key={department.Department_id}>{departmentLabel(department.Department_name)}</option>)}</select>
                            <select aria-label="Filter report by status" value={draftFilters.status} onChange={(event) => setDraftFilters({ ...draftFilters, status: event.target.value })}>
                                <option value="all">All Status</option>
                                <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="earlyLeave">Early Leave</option>
                            </select>
                            <button className="reports-apply-button" onClick={applyFilters}>Apply</button>
                            <button className="reports-reset-button" onClick={resetFilters}>Reset</button>
                        </div>
                        {filterError && <p className="reports-filter-error" role="alert">{filterError}</p>}

                        <div className="reports-table-heading">
                            <h2>{activeTab === 'detailed' ? 'Attendance Report' : activeTab === 'department' ? 'Department Report' : activeTab === 'employee' ? 'Employee Report' : activeTab === 'monthly' ? 'Monthly Summary' : 'Export History'} <span>({activeTab === 'history' ? exportHistory.length : activeTab === 'department' ? departmentSummaries.length : reportRows.length} {activeTab === 'history' ? 'exports' : 'results'})</span></h2>
                            {activeTab !== 'history' && <label>Show <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="5">5</option><option value="10">10</option><option value="25">25</option><option value="50">50</option></select> entries</label>}
                        </div>

                        {activeTab === 'history' ? (
                            <ExportHistory history={exportHistory} loading={loading} error={error} />
                        ) : error ? (
                            <div className="reports-state reports-error">{error}<button onClick={() => loadData(true)}>Retry</button></div>
                        ) : loading ? (
                            <div className="reports-state">Loading report data…</div>
                        ) : (
                            <>
                                {activeTab === 'department' ? (
                                    <DepartmentTable departments={departmentReportRows} />
                                ) : activeTab === 'monthly' ? (
                                    <MonthlySummary rows={reportRows} from={filters.from} to={filters.to} />
                                ) : (
                                    <ReportTable rows={pageRows} offset={(page - 1) * pageSize} onSelectRow={setSelectedReportRow} />
                                )}
                                {activeTab !== 'monthly' && <div className="reports-table-footer">
                                    <span>Showing {reportRows.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, reportRows.length)} of {reportRows.length} entries</span>
                                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                                </div>}
                            </>
                        )}
                    </section>
                </div>
            </main>
            {selectedReportRow && <ReportDetails row={selectedReportRow} onClose={() => setSelectedReportRow(null)} />}
        </div>
    );
}

function ChartLoading() {
    return <div className="reports-chart-state">Loading chart…</div>;
}

function ChartError({ message }) {
    return <div className="reports-chart-state reports-chart-error">{message}</div>;
}

function TrendChart({ data, maximum }) {
    const width = 360;
    const height = 128;
    const left = 27;
    const right = 7;
    const top = 8;
    const bottom = 21;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const values = ['present', 'absent', 'late', 'earlyLeave'];
    const x = (index) => left + (data.length <= 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
    const y = (value) => top + chartHeight - (value / maximum) * chartHeight;
    const step = data.length > 20 ? Math.ceil(data.length / 7) : Math.max(1, Math.ceil(data.length / 7));

    return (
        <div className="reports-trend-chart">
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Attendance trend line chart">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                    const value = maximum * (5 - index) / 5;
                    const lineY = top + (chartHeight * index / 5);
                    return <g key={index}><line className="trend-grid-line" x1={left} x2={width - right} y1={lineY} y2={lineY} /><text className="trend-axis-label" x={left - 5} y={lineY + 3} textAnchor="end">{Math.round(value)}</text></g>;
                })}
                {values.map((key) => {
                    const points = data.map((point, index) => `${x(index)},${y(point[key])}`).join(' ');
                    return <g key={key}>
                        <polyline className="trend-line" points={points} stroke={COLORS[key === 'earlyLeave' ? 'Early Leave' : key.charAt(0).toUpperCase() + key.slice(1)]} />
                        {data.map((point, index) => <circle key={`${key}-${point.key}`} cx={x(index)} cy={y(point[key])} r={data.length <= 12 ? 1.9 : 1.3} fill={COLORS[key === 'earlyLeave' ? 'Early Leave' : key.charAt(0).toUpperCase() + key.slice(1)]} />)}
                    </g>;
                })}
                {data.filter((_, index) => index % step === 0 || index === data.length - 1).map((point) => {
                    const index = data.indexOf(point);
                    return <text key={point.key} className="trend-axis-label" x={x(index)} y={height - 5} textAnchor="middle">{point.label}</text>;
                })}
            </svg>
            {!data.length && <span className="trend-empty-message">No attendance data in this date range</span>}
        </div>
    );
}

function DepartmentChart({ departments }) {
    const colors = ['#0875f9', '#9441f4', '#ff9d24', '#ff4d51', '#10bb82', '#738199', '#02a6bf'];
    const totalEmployees = departments.reduce((sum, department) => sum + department.employees, 0);
    const slices = departments.map((department, index) => ({
        ...department,
        color: colors[index % colors.length],
        size: totalEmployees ? (department.employees / totalEmployees) * 100 : 0
    }));
    let angle = 0;
    const gradient = slices.map((slice) => {
        const start = angle;
        angle += slice.size;
        return `${slice.color} ${start}% ${angle}%`;
    }).join(', ');

    return (
        <div className="department-chart-content">
            <div className="department-donut" style={{ background: slices.length ? `conic-gradient(${gradient})` : '#edf2fa' }}>
                <div className="department-donut-label"><strong>{totalEmployees}</strong><span>Employees</span></div>
            </div>
            <div className="department-chart-legend">
                {slices.slice(0, 6).map((department) => <div className="department-legend-row" key={department.departmentId}><i style={{ backgroundColor: department.color }} /><span>{department.name}</span><strong>{department.percent}%</strong></div>)}
                {!slices.length && <span className="chart-no-data">No department data</span>}
            </div>
        </div>
    );
}

function StatusChart({ data, total }) {
    const maximum = Math.max(1, ...data.map((item) => item.count));
    return (
        <div className="status-chart">
            <div className="status-chart-y-axis"><span>{maximum}</span><span>{Math.round(maximum * .75)}</span><span>{Math.round(maximum * .5)}</span><span>{Math.round(maximum * .25)}</span><span>0</span></div>
            <div className="status-chart-plot">
                {[0, 1, 2, 3].map((line) => <span className="status-grid-line" key={line} style={{ bottom: `${line * 25}%` }} />)}
                {data.map((item) => {
                    const percentage = total ? Math.round((item.count / total) * 100) : 0;
                    return <div className="status-bar-column" key={item.label}>
                        <strong>{item.count}<small>{percentage}%</small></strong>
                        <span className="status-bar" style={{ height: `${item.count ? Math.max(7, (item.count / maximum) * 78) : 0}px`, backgroundColor: item.color }} />
                        <small>{item.label}</small>
                    </div>;
                })}
                {!total && <span className="status-chart-empty">No records in this period</span>}
            </div>
        </div>
    );
}

function ReportTable({ rows, offset, onSelectRow }) {
    return (
        <div className="reports-table-scroll">
            <table className="reports-table">
                <thead><tr><th>#</th><th>Employee</th><th>Department</th><th>Total days</th><th>Present</th><th>Absent</th><th>Late</th><th>Early leave</th><th>Attendance %</th><th>Actions</th></tr></thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={row.employeeId}>
                            <td>{offset + index + 1}</td>
                            <td><div className="report-employee"><span style={{ backgroundColor: AVATAR_COLORS[(offset + index) % AVATAR_COLORS.length] }}>{row.employeeName.charAt(0).toUpperCase()}</span><strong>{row.employeeName}<small>{row.employeeCode}</small></strong></div></td>
                            <td>{row.department}</td><td>{row.totalDays}</td><td>{row.present}</td><td className="report-absent-number">{row.absent}</td><td className="report-late-number">{row.late}</td><td className="report-early-number">{row.earlyLeave}</td>
                            <td><div className="report-percent-cell"><strong>{row.attendancePercent}%</strong><span><i style={{ width: `${row.attendancePercent}%` }} className={row.attendancePercent < 80 ? 'warning' : ''} /></span></div></td>
                            <td><button className="report-row-action" title={`View ${row.employeeName} report`} onClick={() => onSelectRow(row)}><Icon type="dots" size={16} /></button></td>
                        </tr>
                    ))}
                    {!rows.length && <tr><td className="reports-empty-cell" colSpan="10">No report data matches these filters.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function DepartmentTable({ departments }) {
    return (
        <div className="reports-table-scroll">
            <table className="reports-table department-report-table">
                <thead><tr><th>#</th><th>Department</th><th>Employees</th><th>Present</th><th>Late</th><th>Attendance %</th></tr></thead>
                <tbody>
                    {departments.map((department, index) => <tr key={department.departmentId}><td>{index + 1}</td><td><strong>{department.name}</strong></td><td>{department.employees}</td><td>{department.present}</td><td className="report-late-number">{department.late}</td><td><div className="report-percent-cell"><strong>{department.percent}%</strong><span><i style={{ width: `${department.percent}%` }} /></span></div></td></tr>)}
                    {!departments.length && <tr><td className="reports-empty-cell" colSpan="6">No department data for the selected period.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function MonthlySummary({ rows, from, to }) {
    const total = rows.reduce((sum, row) => sum + row.totalDays, 0);
    const present = rows.reduce((sum, row) => sum + row.present, 0);
    const absent = rows.reduce((sum, row) => sum + row.absent, 0);
    const late = rows.reduce((sum, row) => sum + row.late, 0);
    const percentage = total ? Math.round(((present + late) / total) * 100) : 0;
    return (
        <div className="monthly-summary-grid">
            <div><small>Report period</small><strong>{formatRangeDate(from)} — {formatRangeDate(to)}</strong></div>
            <div><small>Employees included</small><strong>{rows.length}</strong></div>
            <div><small>Present days</small><strong className="monthly-present">{present}</strong></div>
            <div><small>Absent days</small><strong className="monthly-absent">{absent}</strong></div>
            <div><small>Late arrivals</small><strong className="monthly-late">{late}</strong></div>
            <div><small>Attendance rate</small><strong>{percentage}%</strong></div>
        </div>
    );
}

function ExportHistory({ history, loading, error }) {
    if (error) return <div className="reports-state reports-error">{error}</div>;
    if (loading) return <div className="reports-state">Loading report data…</div>;
    if (!history.length) return <div className="reports-state">No exports yet. Generate a report to see it here.</div>;
    return (
        <div className="reports-table-scroll">
            <table className="reports-table history-table">
                <thead><tr><th>File</th><th>Date range</th><th>Records</th><th>Generated</th></tr></thead>
                <tbody>{history.map((item, index) => <tr key={`${item.fileName}-${item.generatedAt}-${index}`}><td>{item.fileName}</td><td>{formatDate(item.from)} – {formatDate(item.to)}</td><td>{item.records}</td><td>{new Date(item.generatedAt).toLocaleString()}</td></tr>)}</tbody>
            </table>
        </div>
    );
}

function Pagination({ page, totalPages, setPage }) {
    const first = Math.max(1, Math.min(page - 1, totalPages - 2));
    const visiblePages = Array.from({ length: Math.min(3, totalPages) }, (_, index) => first + index);
    return (
        <div className="reports-pagination">
            <button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
            {visiblePages.map((number) => <button className={page === number ? 'current' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}
            <button aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
        </div>
    );
}

function ReportDetails({ row, onClose }) {
    return (
        <div className="report-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <section className="report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-dialog-title">
                <button className="report-dialog-close" aria-label="Close report details" onClick={onClose}>×</button>
                <span className="report-dialog-avatar">{row.employeeName.charAt(0).toUpperCase()}</span>
                <h2 id="report-dialog-title">{row.employeeName}</h2>
                <p>{row.employeeCode} · {row.department}</p>
                <dl>
                    <div><dt>Working days</dt><dd>{row.totalDays}</dd></div>
                    <div><dt>Present</dt><dd>{row.present}</dd></div>
                    <div><dt>Absent</dt><dd>{row.absent}</dd></div>
                    <div><dt>Late</dt><dd>{row.late}</dd></div>
                    <div><dt>Early leave</dt><dd>{row.earlyLeave}</dd></div>
                    <div><dt>Attendance</dt><dd>{row.attendancePercent}%</dd></div>
                </dl>
            </section>
        </div>
    );
}

export default AdminReports;
