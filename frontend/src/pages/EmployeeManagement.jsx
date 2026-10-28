import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getEmployees,
    getDepartments
} from '../services/api';

import './EmployeeManagement.css';


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


function EmployeeManagement() {

    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const [currentPage, setCurrentPage] = useState(1);

    const employeesPerPage = 8;


    /* =========================
       CURRENT ADMIN
    ========================= */

    const employee = JSON.parse(
        localStorage.getItem('employee') || '{}'
    );


    /* =========================
       LOAD EMPLOYEES
    ========================= */

    useEffect(() => {

        const loadData = async () => {

            try {

                const [
                    employeeResult,
                    departmentResult
                ] = await Promise.all([
                    getEmployees(),
                    getDepartments()
                ]);


                if (!employeeResult.response.ok) {

                    throw new Error(
                        employeeResult.data.message ||
                        'Failed to load employees'
                    );

                }


                if (!departmentResult.response.ok) {

                    throw new Error(
                        departmentResult.data.message ||
                        'Failed to load departments'
                    );

                }


                setEmployees(
                    employeeResult.data
                );

                setDepartments(
                    departmentResult.data
                );


            } catch (error) {

                console.error(
                    'Employee management error:',
                    error
                );

                setError(
                    error.message ||
                    'Failed to load data'
                );

            } finally {

                setLoading(false);

            }

        };


        loadData();

    }, []);


    /* =========================
       DEPARTMENT NAME
    ========================= */

    const getDepartmentName = (departmentId) => {

        const department = departments.find(
            item =>
                item.Department_id === departmentId
        );

        return department
            ? department.Department_name
            : 'Unknown';

    };


    /* =========================
       FILTER
    ========================= */

    const filteredEmployees =
        employees.filter(item => {

            const searchValue =
                search.trim().toLowerCase();


            const matchesSearch =
                !searchValue ||
                item.Name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                item.Employee_code
                    ?.toLowerCase()
                    .includes(searchValue) ||
                item.Email
                    ?.toLowerCase()
                    .includes(searchValue);


            const matchesDepartment =
                departmentFilter === 'All' ||
                String(item.Department_id) ===
                String(departmentFilter);


            const matchesStatus =
                statusFilter === 'All' ||
                (
                    statusFilter === 'Active' &&
                    item.Is_Active
                ) ||
                (
                    statusFilter === 'Disabled' &&
                    !item.Is_Active
                );


            return (
                matchesSearch &&
                matchesDepartment &&
                matchesStatus
            );

        });


    /* =========================
       PAGINATION
    ========================= */

    const totalPages = Math.ceil(
        filteredEmployees.length /
        employeesPerPage
    );


    const startIndex =
        (currentPage - 1) *
        employeesPerPage;


    const endIndex =
        startIndex +
        employeesPerPage;


    const currentEmployees =
        filteredEmployees.slice(
            startIndex,
            endIndex
        );


    /* =========================
       RESET PAGE WHEN FILTERING
    ========================= */

    useEffect(() => {

        setCurrentPage(1);

    }, [
        search,
        departmentFilter,
        statusFilter
    ]);


    /* =========================
       STATISTICS
    ========================= */

    const totalEmployees =
        employees.length;


    const activeEmployees =
        employees.filter(
            item => item.Is_Active
        ).length;


    const disabledEmployees =
        employees.filter(
            item => !item.Is_Active
        ).length;


    const adminEmployees =
        employees.filter(
            item => item.Role === 'Admin'
        ).length;


    const activePercentage =
        totalEmployees
            ? Math.round(
                (activeEmployees /
                    totalEmployees) * 100
            )
            : 0;


    const disabledPercentage =
        totalEmployees
            ? Math.round(
                (disabledEmployees /
                    totalEmployees) * 100
            )
            : 0;


    const adminPercentage =
        totalEmployees
            ? Math.round(
                (adminEmployees /
                    totalEmployees) * 100
            )
            : 0;


    /* =========================
       FORMAT DATE
    ========================= */

    const formatDate = (date) => {

        if (!date) {
            return '-';
        }


        const parts =
            String(date).split('T')[0]
                .split('-');


        if (parts.length !== 3) {
            return date;
        }


        const [
            year,
            month,
            day
        ] = parts;


        const dateObject = new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );


        return dateObject.toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );

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
       ADD EMPLOYEE
    ========================= */

    const handleAddEmployee = () => {

        alert(
            'Add Employee form will be implemented next.'
        );

    };


    /* =========================
       ACTION
    ========================= */

    const handleAction = (item) => {

        alert(
            `Actions for ${item.Name} will be implemented next.`
        );

    };


    /* =========================
       PAGE CHANGE
    ========================= */

    const goToPage = (page) => {

        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(page);

    };


    /* =========================
       RENDER
    ========================= */

    return (

        <div className="employee-management-layout">


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="employee-sidebar">


                {/* LOGO */}

                <div className="employee-brand">

                    <div className="employee-brand-logo">
                        <span>♟</span>
                    </div>


                    <div className="employee-brand-text">

                        <h2>
                            EMPLOYEE
                        </h2>

                        <span>
                            MANAGEMENT
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="employee-sidebar-nav">


                    <div className="employee-nav-section">
                        MAIN
                    </div>


                    <button
                        className="employee-nav-item"
                        onClick={() =>
                            navigate('/admin/dashboard')
                        }
                    >

                        <span className="employee-nav-icon">
                            ⌂
                        </span>

                        <span>
                            Dashboard
                        </span>

                    </button>


                    <button
                        className="employee-nav-item active"
                    >

                        <span className="employee-nav-icon">
                            ♧
                        </span>

                        <span>
                            Employees
                        </span>

                    </button>


                    <button
                        className="employee-nav-item"
                        onClick={() =>
                            navigate('/admin/attendance')
                        }
                    >

                        <span className="employee-nav-icon">
                            ▣
                        </span>

                        <span>
                            Attendance
                        </span>

                    </button>


                    <button
                        className="employee-nav-item"
                        onClick={() =>
                            navigate('/admin/reports')
                        }
                    >

                        <span className="employee-nav-icon">
                            ▥
                        </span>

                        <span>
                            Reports
                        </span>

                    </button>


                </nav>


                {/* SIDEBAR BOTTOM */}

                <div className="employee-sidebar-bottom">


                    <div className="employee-mini-profile">

                        <div
                            className="employee-mini-avatar"
                            style={getAvatarStyle(employee.Employee_code || employee.Name || '')}
                        >

                            {employee.Name
                                ? employee.Name
                                    .charAt(0)
                                    .toUpperCase()
                                : 'N'}

                        </div>


                        <div className="employee-mini-info">

                            <strong>
                                {employee.Name || 'Nikith'}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                    </div>


                    <button
                        className="employee-logout"
                        onClick={handleLogout}
                    >

                        <span>
                            ⇥
                        </span>

                        Logout

                    </button>


                </div>


            </aside>


            {/* =========================
                MAIN
            ========================= */}

            <main className="employee-main-content">


                {/* TOPBAR */}

                <header className="employee-topbar">


                    <div className="employee-search-top">

                        <span>
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search employees, departments, or roles..."
                        />

                    </div>


                    <div className="employee-topbar-right">


                        <button className="notification-button">

                            ♧

                            <span></span>

                        </button>


                        <div className="topbar-divider"></div>


                        <div className="topbar-profile">

                            <div className="topbar-avatar">

                                {employee.Name
                                    ? employee.Name
                                        .charAt(0)
                                        .toUpperCase()
                                    : 'N'}

                            </div>


                            <div className="topbar-profile-info">

                                <strong>
                                    {employee.Name || 'Nikith'}
                                </strong>

                                <small>
                                    Administrator
                                </small>

                            </div>


                            <span className="profile-arrow">
                               ⌄
                            </span>

                        </div>


                    </div>


                </header>


                {/* =========================
                    PAGE CONTENT
                ========================= */}

                <div className="employee-page-content">


                    {/* PAGE HEADER */}

                    <div className="employee-page-header">


                        <div>

                            <span className="employee-page-eyebrow">
                                EMPLOYEES
                            </span>


                            <h1>
                                Employee Management
                            </h1>


                            <p>
                                Manage your team, roles, and
                                access to the attendance system
                            </p>

                        </div>


                        <button
                            className="add-employee-button"
                            onClick={handleAddEmployee}
                        >

                            <span>
                                +
                            </span>

                            Add Employee

                        </button>


                    </div>


                    {/* =========================
                        STAT CARDS
                    ========================= */}

                    <div className="employee-stat-grid">


                        {/* TOTAL */}

                        <div className="employee-stat-card total-card">

                            <div className="stat-icon total">
                                ♧
                            </div>


                            <div className="stat-content">

                                <div className="stat-number">
                                    {totalEmployees}
                                </div>

                                <div className="stat-label">
                                    Total Employees
                                </div>


                                <div className="stat-trend green">
                                    ↑
                                    <span>
                                        2 this month
                                    </span>
                                </div>

                            </div>

                        </div>


                        {/* ACTIVE */}

                        <div className="employee-stat-card active-card">

                            <div className="stat-icon active">
                                ♙
                            </div>


                            <div className="stat-content">

                                <div className="stat-number">
                                    {activeEmployees}
                                </div>

                                <div className="stat-label">
                                    Active Employees
                                </div>


                                <div className="stat-trend green">
                                    ↗
                                    <span>
                                        {activePercentage}% of total
                                    </span>
                                </div>

                            </div>

                        </div>


                        {/* DISABLED */}

                        <div className="employee-stat-card disabled-card">

                            <div className="stat-icon disabled">
                                ⊘
                            </div>


                            <div className="stat-content">

                                <div className="stat-number">
                                    {disabledEmployees}
                                </div>

                                <div className="stat-label">
                                    Disabled Employees
                                </div>


                                <div className="stat-trend red">
                                    ↘
                                    <span>
                                        {disabledPercentage}% of total
                                    </span>
                                </div>

                            </div>

                        </div>


                        {/* ADMIN */}

                        <div className="employee-stat-card admin-card">

                            <div className="stat-icon admin">
                                ♢
                            </div>


                            <div className="stat-content">

                                <div className="stat-number">
                                    {adminEmployees}
                                </div>

                                <div className="stat-label">
                                    Administrators
                                </div>


                                <div className="stat-trend purple">
                                    ↗
                                    <span>
                                        {adminPercentage}% of total
                                    </span>
                                </div>

                            </div>

                        </div>


                    </div>


                    {/* =========================
                        ALL EMPLOYEES
                    ========================= */}

                    <section className="employee-table-card">


                        {/* CARD HEADER */}

                        <div className="employee-table-card-header">


                            <div className="all-employees-title">


                                <div className="all-employees-icon">
                                    ♧
                                </div>


                                <div>

                                    <h2>
                                        All Employees
                                    </h2>

                                    <p>
                                        View and manage all employees
                                        in the system
                                    </p>

                                </div>

                            </div>


                            <div className="employee-table-controls">


                                {/* SEARCH */}

                                <div className="employee-table-search">

                                    <span>
                                        ⌕
                                    </span>

                                    <input
                                        type="text"
                                        placeholder="Search by name, code, email..."
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                {/* DEPARTMENT */}

                                <select
                                    value={departmentFilter}
                                    onChange={(event) =>
                                        setDepartmentFilter(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="All">
                                        All Departments
                                    </option>

                                    {departments.map(
                                        department => (

                                            <option
                                                key={
                                                    department.Department_id
                                                }
                                                value={
                                                    department.Department_id
                                                }
                                            >

                                                {
                                                    department.Department_name
                                                }

                                            </option>

                                        )
                                    )}

                                </select>


                                {/* STATUS */}

                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="All">
                                        All Status
                                    </option>

                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Disabled">
                                        Disabled
                                    </option>

                                </select>


                            </div>


                        </div>


                        {/* =========================
                            TABLE
                        ========================= */}

                        {loading && (

                            <div className="employee-management-message">

                                Loading employees...

                            </div>

                        )}


                        {error && !loading && (

                            <div className="employee-management-message error">

                                {error}

                            </div>

                        )}


                        {!loading &&
                            !error && (

                                <div className="employee-table-wrapper">

                                    <table className="employee-table">


                                        <thead>

                                            <tr>

                                                <th>
                                                    #
                                                </th>

                                                <th>
                                                    EMPLOYEE
                                                </th>

                                                <th>
                                                    EMPLOYEE CODE
                                                </th>

                                                <th>
                                                    DEPARTMENT
                                                </th>

                                                <th>
                                                    ROLE
                                                </th>

                                                <th>
                                                    STATUS
                                                </th>

                                                <th>
                                                    JOINING DATE
                                                </th>

                                                <th>
                                                    ACTIONS
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {currentEmployees.map(
                                                (item, index) => (

                                                    <tr
                                                        key={
                                                            item.Employee_id
                                                        }
                                                    >


                                                        {/* NUMBER */}

                                                        <td className="employee-number">

                                                            {startIndex +
                                                                index +
                                                                1}

                                                        </td>


                                                        {/* EMPLOYEE */}

                                                        <td>

                                                            <div className="employee-name-cell">


                                                                <div
                                                                    className="employee-row-avatar"
                                                                    style={getAvatarStyle(item.Employee_code || item.Name || '')}
                                                                >

                                                                    {item.Name
                                                                        ?.charAt(0)
                                                                        .toUpperCase()}

                                                                </div>


                                                                <div className="employee-name-info">

                                                                    <strong>
                                                                        {
                                                                            item.Name
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            item.Email
                                                                        }
                                                                    </span>

                                                                </div>


                                                            </div>

                                                        </td>


                                                        {/* CODE */}

                                                        <td>

                                                            <span className="employee-code">

                                                                {
                                                                    item.Employee_code
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* DEPARTMENT */}

                                                        <td>

                                                            <span className="department-text">

                                                                {
                                                                    getDepartmentName(
                                                                        item.Department_id
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ROLE */}

                                                        <td>

                                                            <span
                                                                className={
                                                                    item.Role === 'Admin'
                                                                        ? 'role-badge admin'
                                                                        : 'role-badge employee'
                                                                }
                                                            >

                                                                <span>
                                                                    {item.Role === 'Admin'
                                                                        ? '♛'
                                                                        : '♙'}
                                                                </span>

                                                                {
                                                                    item.Role
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* STATUS */}

                                                        <td>

                                                            <span
                                                                className={
                                                                    item.Is_Active
                                                                        ? 'employee-status active'
                                                                        : 'employee-status disabled'
                                                                }
                                                            >

                                                                <span className="status-dot">
                                                                    ●
                                                                </span>

                                                                {
                                                                    item.Is_Active
                                                                        ? 'Active'
                                                                        : 'Disabled'
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* JOINING DATE */}

                                                        <td>

                                                            <span className="joining-date">

                                                                {
                                                                    formatDate(
                                                                        item.Joining_Date
                                                                    )
                                                                }

                                                            </span>

                                                        </td>


                                                        {/* ACTION */}

                                                        <td>

                                                            <button
                                                                className="employee-action-button"
                                                                onClick={() =>
                                                                    handleAction(
                                                                        item
                                                                    )
                                                                }
                                                            >

                                                                •••

                                                            </button>

                                                        </td>


                                                    </tr>

                                                )
                                            )}


                                            {currentEmployees.length ===
                                                0 && (

                                                    <tr>

                                                        <td
                                                            colSpan="8"
                                                            className="no-employees"
                                                        >

                                                            No employees found.

                                                        </td>

                                                    </tr>

                                                )}


                                        </tbody>


                                    </table>

                                </div>

                            )}


                        {/* =========================
                            FOOTER
                        ========================= */}

                        {!loading &&
                            !error &&
                            filteredEmployees.length > 0 && (

                                <div className="employee-table-footer">


                                    <span>

                                        Showing{' '}

                                        <strong>
                                            {startIndex + 1}
                                        </strong>

                                        {' '}to{' '}

                                        <strong>
                                            {Math.min(
                                                endIndex,
                                                filteredEmployees.length
                                            )}
                                        </strong>

                                        {' '}of{' '}

                                        <strong>
                                            {filteredEmployees.length}
                                        </strong>

                                        {' '}employees

                                    </span>


                                    <div className="pagination">


                                        <button
                                            onClick={() =>
                                                goToPage(
                                                    currentPage - 1
                                                )
                                            }
                                            disabled={
                                                currentPage === 1
                                            }
                                        >
                                            ‹
                                        </button>


                                        {Array.from(
                                            {
                                                length: totalPages
                                            },
                                            (_, index) => (

                                                <button
                                                    key={index + 1}
                                                    className={
                                                        currentPage ===
                                                        index + 1
                                                            ? 'active'
                                                            : ''
                                                    }
                                                    onClick={() =>
                                                        goToPage(
                                                            index + 1
                                                        )
                                                    }
                                                >

                                                    {index + 1}

                                                </button>

                                            )
                                        )}


                                        <button
                                            onClick={() =>
                                                goToPage(
                                                    currentPage + 1
                                                )
                                            }
                                            disabled={
                                                currentPage ===
                                                totalPages
                                            }
                                        >
                                            ›
                                        </button>


                                    </div>


                                </div>

                            )}


                    </section>


                </div>


            </main>


        </div>

    );

}


export default EmployeeManagement;