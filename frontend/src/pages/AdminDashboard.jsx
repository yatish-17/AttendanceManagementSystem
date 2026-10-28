import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAdminDashboard,
    getEmployees,
    getDepartments
} from '../services/api';

import './AdminDashboard.css';


/* =========================
   AVATAR COLOR HELPER
========================= */

const AVATAR_COLORS = [
    { backgroundColor: '#fce7f3', color: '#db2777' },  // Pink
    { backgroundColor: '#d1fae5', color: '#059669' },  // Emerald
    { backgroundColor: '#fef3c7', color: '#d97706' },  // Amber
    { backgroundColor: '#ede9fe', color: '#7c3aed' },  // Purple
    { backgroundColor: '#cffafe', color: '#0891b2' },  // Cyan
    { backgroundColor: '#fff7ed', color: '#ea580c' },  // Orange
    { backgroundColor: '#ccfbf1', color: '#0d9488' },  // Teal
    { backgroundColor: '#dbeafe', color: '#1d4ed8' },  // Blue
    { backgroundColor: '#f3e8ff', color: '#9333ea' },  // Violet
    { backgroundColor: '#fdf2f8', color: '#be185d' },  // Rose
];

const getAvatarStyle = (key = '') => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};


/* =========================
   ICON COMPONENT
========================= */

function Icon({ type, size = 22 }) {

    const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    };

    const icons = {

        dashboard: (
            <>
                <path d="M3 13h8V3H3v10Z" />
                <path d="M13 21h8v-8h-8v8Z" />
                <path d="M13 3h8v6h-8V3Z" />
                <path d="M3 17h8v4H3v-4Z" />
            </>
        ),

        employees: (
            <>
                <circle cx="9" cy="8" r="3" />
                <path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                <path d="M16 4.5a3 3 0 0 1 0 7" />
                <path d="M18 15.5c2 .8 3 2.7 3 5.5" />
            </>
        ),

        attendance: (
            <>
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
                <path d="M8 14h2M14 14h2M8 18h2" />
            </>
        ),

        reports: (
            <>
                <path d="M4 20V10" />
                <path d="M10 20V4" />
                <path d="M16 20v-7" />
                <path d="M22 20H2" />
            </>
        ),

        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h2.6V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1.4Z" />
            </>
        ),

        logout: (
            <>
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-5" />
            </>
        ),

        search: (
            <>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
            </>
        ),

        bell: (
            <>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
            </>
        ),

        calendar: (
            <>
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
            </>
        ),

        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),

        arrow: (
            <>
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
            </>
        ),

        users: (
            <>
                <circle cx="9" cy="8" r="3" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M3 21c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                <path d="M15 15c3 .2 5 2.3 5 6" />
            </>
        ),

        check: (
            <>
                <path d="m5 12 4 4L19 6" />
            </>
        ),

        database: (
            <>
                <ellipse cx="12" cy="5" rx="8" ry="3" />
                <path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
                <path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" />
            </>
        ),

        lightning: (
            <>
                <path d="M13 2 4 14h7l-1 8 10-13h-7l0-7Z" />
            </>
        ),

        chart: (
            <>
                <path d="M4 19V5" />
                <path d="M4 19h16" />
                <path d="m7 15 4-4 3 2 5-6" />
            </>
        )
    };

    return (
        <svg {...common}>
            {icons[type] || icons.dashboard}
        </svg>
    );
}


/* =========================
   ADMIN DASHBOARD
========================= */

function AdminDashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const employeeData = JSON.parse(
        localStorage.getItem('employee') || '{}'
    );


    /* =========================
       LOAD DATA
    ========================= */

    const loadData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [
                dashboardResult,
                employeesResult,
                departmentsResult
            ] = await Promise.all([
                getAdminDashboard(),
                getEmployees(),
                getDepartments()
            ]);

            if (dashboardResult.response.ok) {
                setDashboard(dashboardResult.data);
            }

            if (employeesResult.response.ok) {
                setEmployees(employeesResult.data);
            }

            if (departmentsResult.response.ok) {
                setDepartments(departmentsResult.data);
            }

        } catch (error) {
            console.error(
                'Failed to load dashboard:',
                error
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRefresh = () => {
        loadData(true);
    };


    /* =========================
       LOGOUT
    ========================= */

    const handleLogout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('employee');

        navigate('/login');
    };


    /* =========================
       SEARCH
    ========================= */

    const filteredEmployees = useMemo(() => {

        if (!search.trim()) {
            return employees;
        }

        const value = search.toLowerCase();

        return employees.filter(employee =>
            String(employee.Name || '')
                .toLowerCase()
                .includes(value) ||

            String(employee.Employee_code || '')
                .toLowerCase()
                .includes(value) ||

            String(employee.Email || '')
                .toLowerCase()
                .includes(value)
        );

    }, [employees, search]);


    /* =========================
       KPI DATA
    ========================= */

    const activeEmployees = employees.filter(
        employee => employee.Is_Active
    );

    const totalEmployees = activeEmployees.length;

    const summary = dashboard?.summary || {};

    const presentToday =
        summary.presentToday ??
        dashboard?.presentToday ??
        0;

    const lateToday =
        summary.lateToday ??
        dashboard?.lateToday ??
        0;

    const absentToday =
        summary.absentToday ??
        dashboard?.absentToday ??
        Math.max(
            totalEmployees - presentToday,
            0
        );


    const attendancePercentage =
        totalEmployees > 0
            ? Math.round(
                (presentToday / totalEmployees) * 100
            )
            : 0;


    /* =========================
       DEPARTMENT DATA
    ========================= */

    const departmentData = useMemo(() => {

        return departments.map(department => {

            const count = activeEmployees.filter(
                employee =>
                    Number(employee.Department_id) ===
                    Number(department.Department_id)
            ).length;

            return {
                name: department.Department_name,
                count
            };
        });

    }, [departments, activeEmployees]);


    const departmentTotal = departmentData.reduce(
        (sum, item) => sum + item.count,
        0
    );


    /* =========================
       CHART CALCULATION
    ========================= */

    const trend =
        dashboard?.trend ||
        dashboard?.attendanceTrend ||
        dashboard?.weeklyTrend ||
        [];

    const maxChartValue = Math.max(
        totalEmployees,
        ...trend.map(item =>
            Math.max(
                Number(item.present || 0),
                Number(item.absent || 0),
                Number(item.late || 0)
            )
        ),
        4
    );

    const maxChartY = Math.ceil(maxChartValue / 4) * 4;


    /* =========================
       RECENT ATTENDANCE & FORMATTERS
    ========================= */

    const recentAttendance =
        dashboard?.attendance ||
        [];

    const formatDisplayTime = (time) => {
        if (!time) {
            return '--:--';
        }

        const parts = String(time).split(':');

        if (parts.length < 2) {
            return time;
        }

        let hours = Number(parts[0]);
        const minutes = parts[1];
        const period = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;

        return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
    };

    const formatDisplayDate = (date) => {
        if (!date) {
            return '--';
        }

        const dateString = String(date).substring(0, 10);
        const parts = dateString.split('-');

        if (parts.length !== 3) {
            return dateString;
        }

        const [year, month, day] = parts;

        const d = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    };


    /* =========================
       LOADING
    ========================= */

    if (loading) {

        return (
            <div className="admin-loading">
                <div className="admin-loader"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }


    return (

        <div className="admin-dashboard">


            {/* =====================================
                SIDEBAR
            ===================================== */}

            <aside className="admin-sidebar">

                <div className="sidebar-brand">

                    <div className="brand-icon">
                        <Icon
                            type="employees"
                            size={30}
                        />
                    </div>

                    <div>
                        <div className="brand-title">
                            EMPLOYEE
                        </div>

                        <div className="brand-subtitle">
                            MANAGEMENT
                        </div>
                    </div>

                </div>


                <nav className="sidebar-nav">

                    <button
                        className="sidebar-item active"
                        onClick={() =>
                            navigate('/admin/dashboard')
                        }
                    >
                        <Icon
                            type="dashboard"
                            size={24}
                        />

                        <span>
                            Dashboard
                        </span>
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate('/admin/employees')
                        }
                    >
                        <Icon
                            type="employees"
                            size={24}
                        />

                        <span>
                            Employees
                        </span>
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate('/admin/attendance')
                        }
                    >
                        <Icon
                            type="attendance"
                            size={24}
                        />

                        <span>
                            Attendance
                        </span>
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate('/admin/reports')
                        }
                    >
                        <Icon
                            type="reports"
                            size={24}
                        />

                        <span>
                            Reports
                        </span>
                    </button>


                    <button
                        className="sidebar-item"
                        onClick={() =>
                            navigate('/admin/settings')
                        }
                    >
                        <Icon
                            type="settings"
                            size={24}
                        />

                        <span>
                            Settings
                        </span>
                    </button>

                </nav>


                {/* SIDEBAR USER */}

                <div className="sidebar-bottom">

                    <div className="sidebar-user">

                        <div className="sidebar-avatar">
                            {employeeData.Name
                                ?.charAt(0)
                                .toUpperCase() || 'A'}
                        </div>

                        <div>

                            <strong>
                                {employeeData.Name ||
                                    'Admin'}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>


                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <Icon
                            type="logout"
                            size={24}
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =====================================
                MAIN CONTENT
            ===================================== */}

            <main className="admin-main">


                {/* =====================================
                    TOP BAR
                ===================================== */}

                <header className="admin-topbar">

                    <div className="top-search">

                        <Icon
                            type="search"
                            size={22}
                        />

                        <input
                            type="text"
                            placeholder="Search employees, departments, or reports..."
                            value={search}
                            onChange={event =>
                                setSearch(event.target.value)
                            }
                        />

                    </div>


                    <div className="topbar-right">

                        <button className="notification-button">

                            <Icon
                                type="bell"
                                size={25}
                            />

                            <span className="notification-count">
                                3
                            </span>

                        </button>


                        <div className="topbar-divider"></div>


                        <div className="top-profile">

                            <div className="top-profile-avatar">
                                {employeeData.Name
                                    ?.charAt(0)
                                    .toUpperCase() || 'A'}
                            </div>

                            <div className="top-profile-info">

                                <strong>
                                    {employeeData.Name ||
                                        'Admin'}
                                </strong>

                                <span>
                                    Administrator
                                </span>

                            </div>

                            <span className="profile-chevron">
                                ˅
                            </span>

                        </div>

                    </div>

                </header>


                <div className="dashboard-content">


                    {/* =====================================
                        WELCOME AREA
                    ===================================== */}

                    <section className="welcome-row">


                        <div className="welcome-card">

                            <div className="welcome-content">

                                <p>
                                    Good Morning,
                                </p>

                                <h1>
                                    {employeeData.Name ||
                                        'Admin'}

                                    <span>
                                        👋
                                    </span>
                                </h1>

                                <span>
                                    Here’s what’s happening
                                    in your organization today.
                                </span>

                            </div>


                            <div className="welcome-illustration">

                                <div className="illustration-clock">
                                    <Icon
                                        type="clock"
                                        size={40}
                                    />
                                </div>

                                <div className="illustration-person">
                                    <div className="person-head"></div>
                                    <div className="person-body"></div>
                                </div>

                                <div className="illustration-laptop"></div>

                                <div className="illustration-list">

                                    <div>
                                        ✓
                                    </div>

                                    <div>
                                        ✓
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="date-card">

                            <div className="date-icon">
                                <Icon
                                    type="calendar"
                                    size={27}
                                />
                            </div>

                            <div>

                                <span>
                                    {new Date().toLocaleDateString(
                                        'en-US',
                                        {
                                            weekday: 'long'
                                        }
                                    )}
                                </span>

                                <strong>
                                    {new Date().toLocaleDateString(
                                        'en-GB',
                                        {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        }
                                    )}
                                </strong>

                                <p>
                                    “A productive team
                                    builds a successful
                                    organization.”
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* =====================================
                        KPI CARDS
                    ===================================== */}

                    <section className="stats-grid">


                        {/* TOTAL */}

                        <div className="stat-card blue">

                            <div className="stat-icon">
                                <Icon
                                    type="users"
                                    size={30}
                                />
                            </div>

                            <div className="stat-content">

                                <span>
                                    Total Employees
                                </span>

                                <strong>
                                    {totalEmployees}
                                </strong>

                                <small className="positive">
                                    ↑ &nbsp;+2 this month
                                </small>

                            </div>

                            <button className="stat-arrow">
                                <Icon
                                    type="arrow"
                                    size={17}
                                />
                            </button>

                        </div>


                        {/* PRESENT */}

                        <div className="stat-card green">

                            <div className="stat-icon">
                                <Icon
                                    type="employees"
                                    size={30}
                                />
                            </div>

                            <div className="stat-content">

                                <span>
                                    Present Today
                                </span>

                                <strong>
                                    {presentToday}
                                </strong>

                                <small className="positive">
                                    ↗ &nbsp;{attendancePercentage}% attendance
                                </small>

                            </div>

                            <button className="stat-arrow">
                                <Icon
                                    type="arrow"
                                    size={17}
                                />
                            </button>

                        </div>


                        {/* ABSENT */}

                        <div className="stat-card red">

                            <div className="stat-icon">
                                <Icon
                                    type="employees"
                                    size={30}
                                />
                            </div>

                            <div className="stat-content">

                                <span>
                                    Absent Today
                                </span>

                                <strong>
                                    {absentToday}
                                </strong>

                                <small className="negative">
                                    ↘ &nbsp;
                                    {totalEmployees > 0
                                        ? Math.round(
                                            (absentToday /
                                                totalEmployees) *
                                            100
                                        )
                                        : 0}
                                    % of total
                                </small>

                            </div>

                            <button className="stat-arrow">
                                <Icon
                                    type="arrow"
                                    size={17}
                                />
                            </button>

                        </div>


                        {/* LATE */}

                        <div className="stat-card purple">

                            <div className="stat-icon">
                                <Icon
                                    type="clock"
                                    size={30}
                                />
                            </div>

                            <div className="stat-content">

                                <span>
                                    Late Arrivals
                                </span>

                                <strong>
                                    {lateToday}
                                </strong>

                                <small className="purple-text">
                                    ↗ &nbsp;
                                    {totalEmployees > 0
                                        ? Math.round(
                                            (lateToday /
                                                totalEmployees) *
                                            100
                                        )
                                        : 0}
                                    % of total
                                </small>

                            </div>

                            <button className="stat-arrow">
                                <Icon
                                    type="arrow"
                                    size={17}
                                />
                            </button>

                        </div>

                    </section>


                    {/* =====================================
                        CHART ROW
                    ===================================== */}

                    <section className="dashboard-grid">


                        {/* ATTENDANCE OVERVIEW */}

                        <div className="dashboard-card attendance-chart-card">

                            <div className="card-header">

                                <div className="card-title">

                                    <div className="card-title-icon blue-icon">
                                        <Icon
                                            type="employees"
                                            size={25}
                                        />
                                    </div>

                                    <div>
                                        <h2>
                                            Attendance Overview
                                        </h2>

                                        <p>
                                            Last 7 days attendance trend
                                        </p>
                                    </div>

                                </div>


                                <button className="period-button">

                                    <Icon
                                        type="calendar"
                                        size={17}
                                    />

                                    Last 7 Days

                                    <span>
                                        ˅
                                    </span>

                                </button>

                            </div>


                            <div className="chart-legend">

                                <span>
                                    <i className="dot present"></i>
                                    Present
                                </span>

                                <span>
                                    <i className="dot absent"></i>
                                    Absent
                                </span>

                                <span>
                                    <i className="dot late"></i>
                                    Late
                                </span>

                            </div>


                            <div className="attendance-chart">

                                <div className="chart-y-axis">

                                    <span>{maxChartY}</span>
                                    <span>{Math.round(maxChartY * 0.75)}</span>
                                    <span>{Math.round(maxChartY * 0.5)}</span>
                                    <span>{Math.round(maxChartY * 0.25)}</span>
                                    <span>0</span>

                                </div>


                                <div className="chart-area">

                                    <div className="chart-lines">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>


                                    <div className="bars">

                                        {trend.length > 0
                                            ? trend.map(
                                                (item, index) => {

                                                    const present =
                                                        Number(
                                                            item.present ??
                                                            item.Present ??
                                                            item.presentCount ??
                                                            0
                                                        );

                                                    const absent =
                                                        Number(
                                                            item.absent ??
                                                            item.Absent ??
                                                            item.absentCount ??
                                                            0
                                                        );

                                                    const late =
                                                        Number(
                                                            item.late ??
                                                            item.Late ??
                                                            item.lateCount ??
                                                            0
                                                        );

                                                    const presentHeight =
                                                        Math.max(
                                                            Math.round(
                                                                (present / maxChartY) * 135
                                                            ),
                                                            present > 0 ? 6 : 0
                                                        );

                                                    const absentHeight =
                                                        Math.max(
                                                            Math.round(
                                                                (absent / maxChartY) * 135
                                                            ),
                                                            absent > 0 ? 6 : 0
                                                        );

                                                    const lateHeight =
                                                        Math.max(
                                                            Math.round(
                                                                (late / maxChartY) * 135
                                                            ),
                                                            late > 0 ? 6 : 0
                                                        );

                                                    const dayLabel =
                                                        item.DisplayDate ||
                                                        item.label ||
                                                        item.date ||
                                                        '';

                                                    return (

                                                        <div
                                                            className="chart-column"
                                                            key={index}
                                                            title={`${dayLabel} — Present: ${present} | Late: ${late} | Absent: ${absent}`}
                                                        >

                                                            <div className="bar-wrapper">

                                                                <div
                                                                    className="bar present-bar"
                                                                    style={{
                                                                        height: `${presentHeight}px`
                                                                    }}
                                                                    title={`Present: ${present}`}
                                                                />

                                                                <div
                                                                    className="bar absent-bar"
                                                                    style={{
                                                                        height: `${absentHeight}px`
                                                                    }}
                                                                    title={`Absent: ${absent}`}
                                                                />

                                                                <div
                                                                    className="bar late-bar"
                                                                    style={{
                                                                        height: `${lateHeight}px`
                                                                    }}
                                                                    title={`Late: ${late}`}
                                                                />

                                                            </div>


                                                            <span className="chart-label">
                                                                {dayLabel}
                                                            </span>

                                                        </div>
                                                    );
                                                }
                                            )
                                            :
                                            [1, 2, 3, 4, 5, 6, 7].map(
                                                day => (

                                                    <div
                                                        className="chart-column"
                                                        key={day}
                                                    >
                                                        <div className="bar-wrapper">
                                                            <div
                                                                className="bar present-bar"
                                                                style={{
                                                                    height: '10px',
                                                                    opacity: 0.3
                                                                }}
                                                            />
                                                        </div>

                                                        <span className="chart-label">
                                                            --
                                                        </span>

                                                    </div>

                                                )
                                            )}

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* DEPARTMENT DISTRIBUTION */}

                        <div className="dashboard-card department-card">

                            <div className="card-header">

                                <div className="card-title">

                                    <div className="card-title-icon green-icon">
                                        <Icon
                                            type="employees"
                                            size={24}
                                        />
                                    </div>

                                    <div>

                                        <h2>
                                            Department Distribution
                                        </h2>

                                        <p>
                                            Total employees by department
                                        </p>

                                    </div>

                                </div>


                                <button className="view-all-button">
                                    View All
                                </button>

                            </div>


                            <div className="department-content">

                                <div
                                    className="donut-chart"
                                    style={{
                                        background:
                                            departmentTotal > 0
                                                ? `conic-gradient(
                                                    #1769ff 0deg 70deg,
                                                    #8b45ef 70deg 135deg,
                                                    #ffbd4a 135deg 225deg,
                                                    #19c99a 225deg 255deg,
                                                    #ff7a00 255deg 285deg,
                                                    #7436e8 285deg 320deg,
                                                    #4c9ee8 320deg 360deg
                                                )`
                                                : '#e8eef8'
                                    }}
                                >

                                    <div className="donut-center">

                                        <strong>
                                            {departmentTotal}
                                        </strong>

                                        <span>
                                            Employees
                                        </span>

                                    </div>

                                </div>


                                <div className="department-list">

                                    {departmentData
                                        .filter(item => item.count > 0)
                                        .slice(0, 7)
                                        .map((item, index) => (

                                            <div
                                                className="department-item"
                                                key={item.name}
                                            >

                                                <span
                                                    className={`department-dot dot-${index}`}
                                                />

                                                <span>
                                                    {item.name}
                                                </span>

                                                <strong>
                                                    {item.count}
                                                </strong>

                                            </div>

                                        ))}

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =====================================
                        BOTTOM ROW
                    ===================================== */}

                    <section className="bottom-grid">


                        {/* RECENT ATTENDANCE */}

                        <div className="dashboard-card recent-card">

                            <div className="card-header">

                                <div className="card-title">

                                    <div className="card-title-icon green-icon">
                                        <Icon
                                            type="calendar"
                                            size={24}
                                        />
                                    </div>

                                    <div>

                                        <h2>
                                            Recent Attendance
                                        </h2>

                                        <p>
                                            Latest check-in and check-out records
                                        </p>

                                    </div>

                                </div>


                                <button
                                    className="view-all-button"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    title="Refresh recent attendance records"
                                >
                                    {refreshing ? 'Refreshing...' : '↻ Refresh'}
                                </button>

                            </div>


                            <div className="attendance-table">

                                <div className="table-head">

                                    <span>#</span>
                                    <span>EMPLOYEE</span>
                                    <span>DATE</span>
                                    <span>CHECK IN</span>
                                    <span>CHECK OUT</span>
                                    <span>STATUS</span>

                                </div>


                                {recentAttendance.length > 0
                                    ? recentAttendance
                                        .slice(0, 8)
                                        .map(
                                            (item, index) => {

                                                const name =
                                                    item.Name ||
                                                    item.Employee_name ||
                                                    item.name ||
                                                    'Employee';

                                                const status =
                                                    item.Status ||
                                                    item.status ||
                                                    'Present';

                                                return (

                                                    <div
                                                        className="table-row"
                                                        key={
                                                            item.Attendance_id ||
                                                            index
                                                        }
                                                    >

                                                        <span>
                                                            {index + 1}
                                                        </span>

                                                        <div className="employee-cell">

                                                            <div
                                                                className="employee-mini-avatar"
                                                                style={getAvatarStyle(item.Employee_code || item.Name || '')}
                                                            >
                                                                {name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {name}
                                                                </strong>
                                                                {item.Employee_code && (
                                                                    <small style={{ display: 'block', color: '#8898aa', fontSize: '11px' }}>
                                                                        {item.Employee_code} {item.Department_name ? `• ${item.Department_name}` : ''}
                                                                    </small>
                                                                )}
                                                            </div>

                                                        </div>

                                                        <span>
                                                            {formatDisplayDate(
                                                                item.Attendance_Date ||
                                                                item.date
                                                            )}
                                                        </span>

                                                        <span>
                                                            {formatDisplayTime(
                                                                item.In_time ||
                                                                item.inTime
                                                            )}
                                                        </span>

                                                        <span>
                                                            {formatDisplayTime(
                                                                item.Out_time ||
                                                                item.outTime
                                                            )}
                                                        </span>

                                                        <span>
                                                            <StatusBadge
                                                                status={status}
                                                            />
                                                        </span>

                                                    </div>
                                                );
                                            }
                                        )
                                    :
                                    <div className="empty-table">
                                        No recent attendance records
                                    </div>
                                }

                            </div>

                        </div>


                        {/* RIGHT SIDE */}

                        <div className="bottom-right">


                            {/* QUICK ACTIONS */}

                            <div className="dashboard-card quick-actions-card">

                                <div className="card-header">

                                    <div className="card-title">

                                        <div className="card-title-icon blue-icon">
                                            <Icon
                                                type="lightning"
                                                size={24}
                                            />
                                        </div>

                                        <div>

                                            <h2>
                                                Quick Actions
                                            </h2>

                                            <p>
                                                Frequently used actions
                                            </p>

                                        </div>

                                    </div>


                                    <button className="view-all-button">
                                        Customize
                                    </button>

                                </div>


                                <div className="quick-actions-grid">

                                    <button
                                        onClick={() =>
                                            navigate('/admin/employees')
                                        }
                                    >

                                        <span className="quick-icon blue-icon">
                                            <Icon
                                                type="employees"
                                                size={22}
                                            />
                                        </span>

                                        <span>
                                            Add Employee
                                        </span>

                                        <Icon
                                            type="arrow"
                                            size={17}
                                        />

                                    </button>


                                    <button
                                        onClick={() =>
                                            navigate('/admin/employees')
                                        }
                                    >

                                        <span className="quick-icon green-icon">
                                            <Icon
                                                type="calendar"
                                                size={22}
                                            />
                                        </span>

                                        <span>
                                            Manage Attendance
                                        </span>

                                        <Icon
                                            type="arrow"
                                            size={17}
                                        />

                                    </button>


                                    <button
                                        onClick={() =>
                                            navigate('/admin/reports')
                                        }
                                    >

                                        <span className="quick-icon purple-icon">
                                            <Icon
                                                type="reports"
                                                size={22}
                                            />
                                        </span>

                                        <span>
                                            View Reports
                                        </span>

                                        <Icon
                                            type="arrow"
                                            size={17}
                                        />

                                    </button>


                                    <button>

                                        <span className="quick-icon orange-icon">
                                            <Icon
                                                type="employees"
                                                size={22}
                                            />
                                        </span>

                                        <span>
                                            Manage Departments
                                        </span>

                                        <Icon
                                            type="arrow"
                                            size={17}
                                        />

                                    </button>

                                </div>

                            </div>


                            {/* SYSTEM STATUS */}

                            <div className="dashboard-card system-status-card">

                                <div className="system-header">

                                    <div className="system-title">

                                        <div className="card-title-icon blue-icon">
                                            <Icon
                                                type="settings"
                                                size={23}
                                            />
                                        </div>

                                        <div>

                                            <h2>
                                                System Status
                                            </h2>

                                            <p>
                                                All systems are running smoothly
                                            </p>

                                        </div>

                                    </div>


                                    <span className="operational">
                                        <i></i>
                                        Operational
                                    </span>

                                </div>


                                <div className="system-services">

                                    <div>

                                        <div className="service-icon green-icon">
                                            <Icon
                                                type="database"
                                                size={22}
                                            />
                                        </div>

                                        <div>
                                            <strong>
                                                Database
                                            </strong>

                                            <span>
                                                <i></i>
                                                Online
                                            </span>
                                        </div>

                                    </div>


                                    <div>

                                        <div className="service-icon blue-icon">
                                            <Icon
                                                type="chart"
                                                size={22}
                                            />
                                        </div>

                                        <div>
                                            <strong>
                                                API Server
                                            </strong>

                                            <span>
                                                <i></i>
                                                Online
                                            </span><object data="00
                                            " type=""></object>
                                        </div>

                                    </div>


                                    <div>

                                        <div className="service-icon blue-icon">
                                            <Icon
                                                type="database"
                                                size={22}
                                            />
                                        </div>

                                        <div>
                                            <strong>
                                                File Storage
                                            </strong>

                                            <span>
                                                <i></i>
                                                Online
                                            </span>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}


/* =========================
   STATUS BADGE
========================= */

function StatusBadge({ status }) {

    const value = String(status).toLowerCase();

    let className = 'status-present';

    if (value.includes('absent')) {
        className = 'status-absent';
    } else if (value.includes('late')) {
        className = 'status-late';
    } else if (value.includes('early')) {
        className = 'status-early';
    }

    return (
        <span className={`status-badge ${className}`}>
            <i></i>
            {status}
        </span>
    );
}


export default AdminDashboard;