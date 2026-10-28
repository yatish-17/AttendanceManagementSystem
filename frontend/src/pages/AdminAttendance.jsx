import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAllAttendance,
    getDepartments,
    getEmployees
} from '../services/api';
import './AdminAttendance.css';

const STATUS_COLORS = {
    Present: 'present',
    Late: 'late',
    'Early Leave': 'early',
    Incomplete: 'incomplete',
    Absent: 'absent'
};

const dateToInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const dateOnly = (value) => String(value || '').slice(0, 10);

const formatDate = (value, options = { day: '2-digit', month: 'short', year: 'numeric' }) => {
    const parts = dateOnly(value).split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return '—';
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-GB', options);
};

const timeMinutes = (value) => {
    if (!value) return null;
    const [hours, minutes] = String(value).split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
};

const formatTime = (value) => {
    const minutes = timeMinutes(value);
    if (minutes === null) return '—';
    const date = new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0) return '—';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
};

function Icon({ type, size = 18 }) {
    const paths = {
        dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
        employees: <><circle cx="9" cy="8" r="3" /><path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5a3 3 0 0 1 0 6M18 15c2 .8 3 2.6 3 5" /></>,
        attendance: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h2M14 14h2M8 18h2" /></>,
        reports: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
        settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.4-2.8 2.8-1.4-1.4a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-1.9a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-1.4 1.4-2.8-2.8L4.3 15a1.7 1.7 0 0 0-.3-1.8 1.7 1.7 0 0 0-1.5-1H1v-4h1.5a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L2.3 4l2.8-2.8 1.4 1.4a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V0h4v1.5a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l1.4-1.4L20.3 4l-1.4 1.4a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1h1.5v4h-1.5a1.7 1.7 0 0 0-.7 2.8Z" /></>,
        logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></>,
        search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
        bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
        calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
        clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
        chart: <><path d="M4 19V5M4 19h16M7 15l4-4 3 2 5-7" /></>,
        download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
        list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
        chevron: <path d="m9 18 6-6-6-6" />,
        users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
        check: <path d="m5 12 4 4L19 6" />,
        dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>
    };

    return (
        <svg
            aria-hidden="true"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {paths[type] || paths.attendance}
        </svg>
    );
}

function AdminAttendance() {
    const navigate = useNavigate();
    const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');
    const today = dateToInput(new Date());

    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState('records');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [month, setMonth] = useState(new Date());
    const [filterError, setFilterError] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [draftFilters, setDraftFilters] = useState({
        search: '',
        from: today,
        to: today,
        department: 'all',
        status: 'all'
    });
    const [filters, setFilters] = useState({
        search: '',
        from: today,
        to: today,
        department: 'all',
        status: 'all'
    });

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
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

                if (mounted) {
                    setRecords(attendanceResult.data);
                    setEmployees(employeeResult.data);
                    setDepartments(departmentResult.data);
                }
            } catch (loadError) {
                console.error('Attendance page loading error:', loadError);
                if (mounted) setError(loadError.message || 'Unable to connect to the server.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadData();
        return () => {
            mounted = false;
        };
    }, []);

    const employeeById = useMemo(
        () => new Map(employees.map((employee) => [String(employee.Employee_id), employee])),
        [employees]
    );
    const departmentById = useMemo(
        () => new Map(departments.map((department) => [String(department.Department_id), department.Department_name])),
        [departments]
    );
    const activeEmployees = useMemo(
        () => employees.filter((employee) => employee.Is_Active),
        [employees]
    );

    const allRows = useMemo(() => records.map((record) => {
        const employee = employeeById.get(String(record.Employee_id));
        const minutes = timeMinutes(record.In_time) !== null && timeMinutes(record.Out_time) !== null
            ? Math.max(0, timeMinutes(record.Out_time) - timeMinutes(record.In_time))
            : null;
        return {
            ...record,
            employeeName: record.Name || employee?.Name || 'Unknown employee',
            employeeCode: record.Employee_code || employee?.Employee_code || '—',
            department: departmentById.get(String(employee?.Department_id)) || 'Unassigned',
            workingMinutes: minutes,
            recordDate: dateOnly(record.Attendance_Date)
        };
    }), [records, employeeById, departmentById]);

    const filteredRows = useMemo(() => {
        const search = filters.search.trim().toLowerCase();
        return allRows.filter((row) => {
            const matchesSearch = !search ||
                row.employeeName.toLowerCase().includes(search) ||
                String(row.employeeCode).toLowerCase().includes(search);
            const matchesFrom = !filters.from || row.recordDate >= filters.from;
            const matchesTo = !filters.to || row.recordDate <= filters.to;
            const employee = employeeById.get(String(row.Employee_id));
            const matchesDepartment = filters.department === 'all' ||
                String(employee?.Department_id) === filters.department;
            const matchesStatus = filters.status === 'all' ||
                String(row.Status).toLowerCase() === filters.status.toLowerCase();
            return matchesSearch && matchesFrom && matchesTo && matchesDepartment && matchesStatus;
        }).sort((a, b) => b.recordDate.localeCompare(a.recordDate) || a.employeeName.localeCompare(b.employeeName));
    }, [allRows, employeeById, filters]);

    const todayRows = useMemo(
        () => allRows.filter((row) => row.recordDate === today),
        [allRows, today]
    );
    const workDurations = allRows
        .map((row) => row.workingMinutes)
        .filter((minutes) => minutes !== null);
    const averageMinutes = workDurations.length
        ? Math.round(workDurations.reduce((total, minutes) => total + minutes, 0) / workDurations.length)
        : 0;
    const onTimeCount = todayRows.filter((row) => row.Status === 'Present').length;
    const onTimeRate = todayRows.length
        ? Math.round((onTimeCount / todayRows.length) * 100)
        : 0;
    const consistency = activeEmployees.length
        ? Math.min(100, Math.round((new Set(todayRows.map((row) => row.Employee_id)).size / activeEmployees.length) * 100))
        : 0;

    const dayRows = useMemo(
        () => allRows.filter((row) => row.recordDate === (filters.from && filters.from === filters.to ? filters.from : today)),
        [allRows, filters.from, filters.to, today]
    );

    const applyFilters = () => {
        if (draftFilters.from && draftFilters.to && draftFilters.from > draftFilters.to) {
            setFilterError('The start date must be on or before the end date.');
            return;
        }
        setFilterError('');
        setFilters(draftFilters);
        setPage(1);
    };

    const resetFilters = () => {
        const cleared = { search: '', from: '', to: '', department: 'all', status: 'all' };
        setDraftFilters(cleared);
        setFilters(cleared);
        setFilterError('');
        setPage(1);
    };

    const exportCsv = () => {
        const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
        const rows = [
            ['Employee', 'Employee code', 'Department', 'Date', 'Check in', 'Check out', 'Working hours', 'Status'],
            ...filteredRows.map((row) => [
                row.employeeName,
                row.employeeCode,
                row.department,
                row.recordDate,
                row.In_time || '',
                row.Out_time || '',
                formatDuration(row.workingMinutes),
                row.Status || ''
            ])
        ];
        const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance-${today}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
        navigate('/login');
    };

    const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const calendarOffset = (monthStart.getDay() + 6) % 7;
    const visibleMonthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    const monthRows = allRows.filter((row) => row.recordDate.startsWith(visibleMonthKey));
    const attendanceByDate = new Map();
    monthRows.forEach((row) => {
        attendanceByDate.set(row.recordDate, [...(attendanceByDate.get(row.recordDate) || []), row]);
    });
    const selectedDay = filters.from && filters.from === filters.to ? filters.from : today;
    const countsByStatus = dayRows.reduce((counts, row) => {
        counts[row.Status] = (counts[row.Status] || 0) + 1;
        return counts;
    }, {});
    const unmarkedCount = Math.max(0, activeEmployees.length - new Set(dayRows.map((row) => row.Employee_id)).size);

    const changeMonth = (amount) => {
        setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1));
    };

    const chooseCalendarDate = (day) => {
        const chosenDate = dateToInput(new Date(month.getFullYear(), month.getMonth(), day));
        const nextFilters = { ...draftFilters, from: chosenDate, to: chosenDate };
        setDraftFilters(nextFilters);
        setFilters(nextFilters);
        setPage(1);
    };

    const dailyTimeline = [...todayRows].sort((a, b) => String(a.In_time || '').localeCompare(String(b.In_time || '')));
    const firstCheckIn = dailyTimeline[0];
    const peakCheckIn = dailyTimeline[dailyTimeline.length - 1];
    const lastCheckOut = [...todayRows]
        .filter((row) => row.Out_time)
        .sort((a, b) => String(b.Out_time).localeCompare(String(a.Out_time)))[0];

    const recentDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const key = dateToInput(date);
        return {
            key,
            label: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            total: allRows.filter((row) => row.recordDate === key).length
        };
    });
    const maxRecent = Math.max(1, ...recentDays.map((day) => day.total));

    return (
        <div className="attendance-page">
            <aside className="attendance-sidebar">
                <div className="attendance-brand">
                    <div className="attendance-brand-icon"><Icon type="calendar" size={25} /></div>
                    <div><strong>ATTENDANCE</strong><span>MANAGEMENT</span></div>
                </div>
                <nav className="attendance-nav" aria-label="Admin navigation">
                    {[
                        ['dashboard', 'Dashboard', '/admin/dashboard'],
                        ['employees', 'Employees', '/admin/employees'],
                        ['attendance', 'Attendance', '/admin/attendance'],
                        ['reports', 'Reports', '/admin/reports'],
                        ['settings', 'Settings', '/admin/settings']
                    ].map(([icon, label, path]) => (
                        <button
                            className={`attendance-nav-item${label === 'Attendance' ? ' active' : ''}`}
                            key={label}
                            onClick={() => navigate(path)}
                        >
                            <Icon type={icon} size={21} /><span>{label}</span>
                        </button>
                    ))}
                </nav>
                <div className="attendance-side-bottom">
                    <div className="attendance-side-user">
                        <div className="attendance-avatar">{employeeData.Name?.charAt(0).toUpperCase() || 'A'}</div>
                        <div><strong>{employeeData.Name || 'Admin'}</strong><span>System Administrator</span></div>
                    </div>
                    <button className="attendance-logout" onClick={handleLogout}>
                        <Icon type="logout" size={21} /><span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="attendance-main">
                <header className="attendance-topbar">
                    <label className="attendance-global-search">
                        <Icon type="search" size={19} />
                        <input
                            type="search"
                            placeholder="Search employees, department..."
                            value={draftFilters.search}
                            onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') applyFilters();
                            }}
                            aria-label="Search employees and departments"
                        />
                    </label>
                    <div className="attendance-top-actions">
                        <button className="attendance-notification" aria-label="Notifications">
                            <Icon type="bell" size={20} /><span>5</span>
                        </button>
                        <span className="attendance-top-avatar">{employeeData.Name?.charAt(0).toUpperCase() || 'A'}</span>
                        <strong>{employeeData.Name || 'Admin'}</strong>
                        <span className="attendance-profile-chevron">⌄</span>
                    </div>
                </header>

                <div className="attendance-content">
                    <div className="attendance-heading-row">
                        <div>
                            <h1>Attendance</h1>
                            <p>View, manage and analyze employee attendance records</p>
                        </div>
                        <div className="attendance-date-pill"><Icon type="calendar" size={17} />{formatDate(today, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>

                    <section className="attendance-metrics" aria-label="Attendance overview">
                        <article className="attendance-metric metric-hours">
                            <div className="metric-title"><span className="metric-icon"><Icon type="clock" size={20} /></span><div><strong>Average Working Hours</strong><small>Daily average across all employees</small></div></div>
                            <div className="metric-main"><span className="metric-ring clock-ring"><Icon type="clock" size={27} /></span><div><strong>{formatDuration(averageMinutes)}</strong><span className="metric-trend">↑ {workDurations.length ? `${workDurations.length} records` : 'No data yet'}</span></div></div>
                        </article>
                        <article className="attendance-metric metric-rate">
                            <div className="metric-title"><span className="metric-icon"><Icon type="users" size={20} /></span><div><strong>On-time Check-in Rate</strong><small>Employees who checked in on time</small></div></div>
                            <div className="metric-main"><span className="metric-ring rate-ring"><strong>{onTimeRate}%</strong></span><div><span className="metric-trend">↑ {onTimeCount} on time today</span><small>of {todayRows.length} check-ins</small></div></div>
                        </article>
                        <article className="attendance-metric metric-consistency">
                            <div className="metric-title"><span className="metric-icon"><Icon type="chart" size={20} /></span><div><strong>Attendance Consistency</strong><small>Employees checked in today</small></div></div>
                            <div className="consistency-content">
                                <div className="attendance-bars" aria-label="Attendance count for the last seven days">
                                    {recentDays.map((day) => (
                                        <div className="attendance-bar-column" key={day.key}>
                                            <span className="attendance-bar" style={{ height: `${Math.max(8, (day.total / maxRecent) * 56)}px` }} title={`${day.total} records`} />
                                            <small>{day.label}</small>
                                        </div>
                                    ))}
                                </div>
                                <div className="consistency-score"><span className="good-chip">↗ Good</span><strong>{consistency}%</strong><small>overall consistency</small></div>
                            </div>
                        </article>
                        <article className="attendance-metric metric-glance">
                            <div className="metric-title"><span className="glance-sun">☼</span><div><strong>Today at a Glance</strong><small>Employee check-in and check-out activity</small></div></div>
                            <div className="glance-list">
                                {[
                                    ['First Check-in', firstCheckIn, firstCheckIn?.In_time, 'first'],
                                    ['Peak Check-in', peakCheckIn, peakCheckIn?.In_time, 'peak'],
                                    ['Last Check-in', dailyTimeline[dailyTimeline.length - 1], dailyTimeline[dailyTimeline.length - 1]?.In_time, 'last'],
                                    ['Last Check-out', lastCheckOut, lastCheckOut?.Out_time, 'out']
                                ].map(([label, row, time, tone]) => (
                                    <div className="glance-row" key={label}>
                                        <span className={`glance-dot ${tone}`} />
                                        <strong>{label}</strong>
                                        <b>{formatTime(time)}</b>
                                        <small>{row?.employeeName || 'No activity'}</small>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>

                    <section className="attendance-workspace">
                        <div className="attendance-tabs">
                            <div className="attendance-tab-list" role="tablist" aria-label="Attendance views">
                                {[
                                    ['records', 'Attendance Records', 'list'],
                                    ['employee', 'Employee-wise', 'employees'],
                                    ['calendar', 'Calendar View', 'calendar'],
                                    ['summary', 'Summary', 'chart']
                                ].map(([id, label, icon]) => (
                                    <button
                                        role="tab"
                                        aria-selected={tab === id}
                                        className={`attendance-tab${tab === id ? ' active' : ''}`}
                                        key={id}
                                        onClick={() => { setTab(id); setPage(1); }}
                                    >
                                        <Icon type={icon} size={16} />{label}
                                    </button>
                                ))}
                            </div>
                            <button className="attendance-export" onClick={exportCsv}><Icon type="download" size={16} />Export <span>⌄</span></button>
                        </div>

                        <div className="attendance-filters">
                            <label className="filter-search"><Icon type="search" size={17} /><input placeholder="Search by name, employee code..." value={draftFilters.search} onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })} /></label>
                            <label className="filter-date"><Icon type="calendar" size={16} /><input aria-label="Start date" type="date" value={draftFilters.from} onChange={(event) => setDraftFilters({ ...draftFilters, from: event.target.value })} /></label>
                            <label className="filter-date"><Icon type="calendar" size={16} /><input aria-label="End date" type="date" value={draftFilters.to} onChange={(event) => setDraftFilters({ ...draftFilters, to: event.target.value })} /></label>
                            <select aria-label="Filter by department" value={draftFilters.department} onChange={(event) => setDraftFilters({ ...draftFilters, department: event.target.value })}>
                                <option value="all">All Departments</option>
                                {departments.map((department) => <option value={department.Department_id} key={department.Department_id}>{department.Department_name}</option>)}
                            </select>
                            <select aria-label="Filter by status" value={draftFilters.status} onChange={(event) => setDraftFilters({ ...draftFilters, status: event.target.value })}>
                                <option value="all">All Status</option>
                                {Object.keys(STATUS_COLORS).map((status) => <option value={status} key={status}>{status}</option>)}
                            </select>
                            <button className="filter-apply" onClick={applyFilters}>Apply</button>
                            <button className="filter-reset" onClick={resetFilters}>Reset</button>
                        </div>
                        {filterError && <div className="attendance-filter-error" role="alert">{filterError}</div>}

                        <div className="attendance-lower">
                            <aside className="attendance-side-panels">
                                <section className="attendance-calendar-card">
                                    <div className="calendar-card-heading">
                                        <button aria-label="Previous month" onClick={() => changeMonth(-1)}>‹</button>
                                        <strong>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>
                                        <button aria-label="Next month" onClick={() => changeMonth(1)}>›</button>
                                    </div>
                                    <div className="calendar-grid calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
                                    <div className="calendar-grid">
                                        {Array.from({ length: calendarOffset }, (_, index) => <span className="calendar-empty" key={`empty-${index}`} />)}
                                        {Array.from({ length: monthDays }, (_, index) => {
                                            const day = index + 1;
                                            const key = dateToInput(new Date(month.getFullYear(), month.getMonth(), day));
                                            const dayAttendance = attendanceByDate.get(key) || [];
                                            const isSelected = key === selectedDay;
                                            return (
                                                <button className={`calendar-day${isSelected ? ' selected' : ''}`} key={key} onClick={() => chooseCalendarDate(day)}>
                                                    {day}
                                                    {dayAttendance.length > 0 && <i className={dayAttendance.some((row) => row.Status === 'Late') ? 'calendar-mark late-mark' : 'calendar-mark'} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                                <section className="attendance-legend-card">
                                    <h3>Status Legend</h3>
                                    {[
                                        ['Present', countsByStatus.Present || 0, 'present'],
                                        ['Absent', countsByStatus.Absent || 0, 'absent'],
                                        ['Late', countsByStatus.Late || 0, 'late'],
                                        ['Early Leave', countsByStatus['Early Leave'] || 0, 'early'],
                                        ['Not Marked', unmarkedCount, 'unmarked']
                                    ].map(([label, count, color]) => <div className="legend-row" key={label}><span className={`legend-dot ${color}`} /><span>{label}</span><strong>{count}</strong></div>)}
                                </section>
                            </aside>

                            <section className="attendance-results">
                                {tab === 'records' && (
                                    <RecordsTable
                                        rows={pageRows}
                                        onSelectRecord={setSelectedRecord}
                                        start={(page - 1) * pageSize}
                                        total={filteredRows.length}
                                        page={page}
                                        pageCount={pageCount}
                                        pageSize={pageSize}
                                        setPage={setPage}
                                        setPageSize={(value) => { setPageSize(value); setPage(1); }}
                                        loading={loading}
                                        error={error}
                                    />
                                )}
                                {tab === 'employee' && (
                                    <EmployeeSummary rows={filteredRows} loading={loading} error={error} />
                                )}
                                {tab === 'calendar' && (
                                    <CalendarSummary
                                        month={month}
                                        monthRows={monthRows}
                                        days={monthDays}
                                        offset={calendarOffset}
                                        attendanceByDate={attendanceByDate}
                                        onSelectDay={chooseCalendarDate}
                                        loading={loading}
                                        error={error}
                                    />
                                )}
                                {tab === 'summary' && (
                                    <SummaryView
                                        days={recentDays}
                                        max={maxRecent}
                                        present={todayRows.filter((row) => row.Status === 'Present').length}
                                        late={todayRows.filter((row) => row.Status === 'Late').length}
                                        early={todayRows.filter((row) => row.Status === 'Early Leave').length}
                                        unmarked={unmarkedCount}
                                        loading={loading}
                                        error={error}
                                    />
                                )}
                            </section>
                        </div>
                    </section>
                </div>
            </main>
            {selectedRecord && <AttendanceDetailsDialog row={selectedRecord} onClose={() => setSelectedRecord(null)} />}
        </div>
    );
}

function RecordsTable({ rows, onSelectRecord, start, total, page, pageCount, pageSize, setPage, setPageSize, loading, error }) {
    return (
        <>
            <div className="results-heading">
                <h2>Attendance Records ({total})</h2>
                <label>Show <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select> entries</label>
            </div>
            {error ? <div className="attendance-state error-state">{error}</div> : loading ? <div className="attendance-state">Loading attendance records…</div> : (
                <>
                    <div className="attendance-table-scroll">
                        <table className="attendance-table">
                            <thead><tr><th>#</th><th>Employee</th><th>Department</th><th>Date</th><th>Check in</th><th>Check out</th><th>Working hours</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={row.Attendance_id || `${row.Employee_id}-${row.recordDate}`}>
                                        <td>{start + index + 1}</td>
                                        <td><div className="table-employee"><span>{row.employeeName.charAt(0).toUpperCase()}</span><strong>{row.employeeName}<small>{row.employeeCode}</small></strong></div></td>
                                        <td>{row.department}</td><td>{formatDate(row.recordDate)}</td>
                                        <td>{formatTime(row.In_time)}</td><td>{formatTime(row.Out_time)}</td><td>{formatDuration(row.workingMinutes)}</td>
                                        <td><span className={`attendance-status ${STATUS_COLORS[row.Status] || 'unmarked'}`}><i />{row.Status || 'Not Marked'}</span></td>
                                        <td><button className="record-action" title={`View attendance details for ${row.employeeName}`} onClick={() => onSelectRecord(row)}><Icon type="dots" size={16} /></button></td>
                                    </tr>
                                ))}
                                {rows.length === 0 && <tr><td className="empty-table" colSpan="9">No attendance records match these filters.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer">
                        <span>Showing {total ? start + 1 : 0} to {Math.min(start + rows.length, total)} of {total} entries</span>
                        <div className="pagination">
                            <button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
                            {Array.from({ length: pageCount }, (_, index) => index + 1).slice(Math.max(0, page - 2), Math.min(pageCount, page + 1)).map((number) => <button className={number === page ? 'current' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}
                            <button aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>›</button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function AttendanceDetailsDialog({ row, onClose }) {
    return (
        <div className="attendance-dialog-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section className="attendance-dialog" role="dialog" aria-modal="true" aria-labelledby="attendance-dialog-title">
                <button className="attendance-dialog-close" aria-label="Close attendance details" onClick={onClose}>×</button>
                <span className="dialog-avatar">{row.employeeName.charAt(0).toUpperCase()}</span>
                <h2 id="attendance-dialog-title">{row.employeeName}</h2>
                <p>{row.employeeCode} · {row.department}</p>
                <dl>
                    <div><dt>Date</dt><dd>{formatDate(row.recordDate)}</dd></div>
                    <div><dt>Check in</dt><dd>{formatTime(row.In_time)}</dd></div>
                    <div><dt>Check out</dt><dd>{formatTime(row.Out_time)}</dd></div>
                    <div><dt>Working hours</dt><dd>{formatDuration(row.workingMinutes)}</dd></div>
                    <div><dt>Status</dt><dd><span className={`attendance-status ${STATUS_COLORS[row.Status] || 'unmarked'}`}><i />{row.Status || 'Not Marked'}</span></dd></div>
                </dl>
            </section>
        </div>
    );
}

function EmployeeSummary({ rows, loading, error }) {
    const summaries = useMemo(() => {
        const groups = new Map();
        rows.forEach((row) => {
            const employeeId = String(row.Employee_id);
            const current = groups.get(employeeId) || { employee: row, count: 0, minutes: 0, statuses: {} };
            current.count += 1;
            current.minutes += row.workingMinutes || 0;
            current.statuses[row.Status] = (current.statuses[row.Status] || 0) + 1;
            groups.set(employeeId, current);
        });
        return [...groups.values()].sort((a, b) => a.employee.employeeName.localeCompare(b.employee.employeeName));
    }, [rows]);

    if (error || loading) return <div className={`attendance-state${error ? ' error-state' : ''}`}>{error || 'Loading employee attendance…'}</div>;
    return (
        <>
            <div className="results-heading"><h2>Employee-wise Attendance ({summaries.length})</h2></div>
            <div className="attendance-table-scroll">
                <table className="attendance-table employee-summary-table">
                    <thead><tr><th>Employee</th><th>Department</th><th>Days marked</th><th>Working hours</th><th>Present</th><th>Late</th></tr></thead>
                    <tbody>{summaries.map(({ employee, count, minutes, statuses }) => <tr key={employee.Employee_id}><td><div className="table-employee"><span>{employee.employeeName.charAt(0).toUpperCase()}</span><strong>{employee.employeeName}<small>{employee.employeeCode}</small></strong></div></td><td>{employee.department}</td><td>{count}</td><td>{formatDuration(minutes)}</td><td>{statuses.Present || 0}</td><td>{statuses.Late || 0}</td></tr>)}</tbody>
                </table>
                {!summaries.length && <div className="attendance-state">No attendance records match these filters.</div>}
            </div>
        </>
    );
}

function CalendarSummary({ month, monthRows, days, offset, attendanceByDate, onSelectDay, loading, error }) {
    if (error || loading) return <div className={`attendance-state${error ? ' error-state' : ''}`}>{error || 'Loading calendar…'}</div>;
    return (
        <>
            <div className="results-heading"><h2>{month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} Attendance</h2><span>{monthRows.length} records</span></div>
            <div className="large-calendar">
                <div className="calendar-grid calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
                <div className="large-calendar-grid">
                    {Array.from({ length: offset }, (_, index) => <span className="large-calendar-empty" key={`empty-${index}`} />)}
                    {Array.from({ length: days }, (_, index) => {
                        const day = index + 1;
                        const key = dateToInput(new Date(month.getFullYear(), month.getMonth(), day));
                        const dayRecords = attendanceByDate.get(key) || [];
                        return <button className="large-calendar-day" key={key} onClick={() => onSelectDay(day)}><strong>{day}</strong><span>{dayRecords.length ? `${dayRecords.length} check-ins` : '—'}</span>{dayRecords.length > 0 && <small>{dayRecords.filter((row) => row.Status === 'Late').length} late</small>}</button>;
                    })}
                </div>
            </div>
        </>
    );
}

function SummaryView({ days, max, present, late, early, unmarked, loading, error }) {
    if (error || loading) return <div className={`attendance-state${error ? ' error-state' : ''}`}>{error || 'Loading attendance summary…'}</div>;
    return (
        <>
            <div className="results-heading"><h2>Attendance Summary</h2><span>Today’s overview</span></div>
            <div className="summary-counters">
                {[['Present', present, 'present'], ['Late', late, 'late'], ['Early Leave', early, 'early'], ['Not Marked', unmarked, 'unmarked']].map(([label, value, color]) => <div className="summary-counter" key={label}><span className={`legend-dot ${color}`} /><small>{label}</small><strong>{value}</strong></div>)}
            </div>
            <div className="summary-chart"><h3>Attendance trend · last 7 days</h3><div className="summary-chart-bars">{days.map((day) => <div className="summary-chart-column" key={day.key}><strong>{day.total}</strong><span style={{ height: `${Math.max(6, (day.total / max) * 150)}px` }} /><small>{day.label}</small></div>)}</div></div>
        </>
    );
}

export default AdminAttendance;
