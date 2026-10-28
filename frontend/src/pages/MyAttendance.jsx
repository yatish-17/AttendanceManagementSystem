import { useEffect, useState } from 'react';

import {
    useNavigate,
    Link
} from 'react-router-dom';

import {
    getMyAttendance
} from '../services/api';

import './MyAttendance.css';

function MyAttendance() {

    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const employee = JSON.parse(
        localStorage.getItem('employee')
    );

    /*
        Load attendance records.
    */

    useEffect(() => {

        loadAttendance();

    }, []);

    const loadAttendance = async () => {

        try {

            setLoading(true);
            setError('');

            const { response, data } =
                await getMyAttendance();

            if (!response.ok) {

                setError(
                    data.message ||
                    'Failed to load attendance'
                );

                return;
            }

            setAttendance(data);
            setFilteredAttendance(data);

        } catch (error) {

            console.error(
                'Attendance loading error:',
                error
            );

            setError(
                'Unable to connect to the server'
            );

        } finally {

            setLoading(false);
        }
    };

    /*
        Apply filters.
    */

    useEffect(() => {

        let filtered = [...attendance];

        /*
            Search by attendance date.
        */

        if (search.trim()) {

            const searchText =
                search.trim().toLowerCase();

            filtered = filtered.filter(
                (record) => {

                    const attendanceDate =
                        String(
                            record.Attendance_Date || ''
                        ).substring(0, 10);

                    return attendanceDate
                        .toLowerCase()
                        .includes(searchText);
                }
            );
        }

        /*
            Filter by status.
        */

        if (statusFilter !== 'All') {

            filtered = filtered.filter(
                (record) =>
                    record.Status === statusFilter
            );
        }

        /*
            Filter by starting date.
        */

        if (fromDate) {

            filtered = filtered.filter(
                (record) => {

                    const attendanceDate =
                        String(
                            record.Attendance_Date || ''
                        ).substring(0, 10);

                    return attendanceDate >= fromDate;
                }
            );
        }

        /*
            Filter by ending date.
        */

        if (toDate) {

            filtered = filtered.filter(
                (record) => {

                    const attendanceDate =
                        String(
                            record.Attendance_Date || ''
                        ).substring(0, 10);

                    return attendanceDate <= toDate;
                }
            );
        }

        setFilteredAttendance(filtered);

    }, [
        attendance,
        search,
        statusFilter,
        fromDate,
        toDate
    ]);

    /*
        Format attendance date.
    */

    const formatDate = (date) => {

        if (!date) {
            return '-';
        }

        const dateString =
            String(date).substring(0, 10);

        const parts =
            dateString.split('-');

        if (parts.length !== 3) {
            return dateString;
        }

        const [
            year,
            month,
            day
        ] = parts;

        const formattedDate =
            new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
            );

        return formattedDate.toLocaleDateString(
            'en-US',
            {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }
        );
    };

    /*
        Format attendance time.
    */

    const formatTime = (time) => {

        if (!time) {
            return '-';
        }

        const parts =
            String(time).split(':');

        if (parts.length < 2) {
            return time;
        }

        let hour =
            Number(parts[0]);

        const minute =
            parts[1];

        const period =
            hour >= 12
                ? 'PM'
                : 'AM';

        hour =
            hour % 12 || 12;

        return `${String(hour).padStart(2, '0')}:${minute} ${period}`;
    };

    /*
        Get status CSS class.
    */

    const getStatusClass = (status) => {

        switch (status) {

            case 'Present':
                return 'present';

            case 'Late':
                return 'late';

            case 'Early Leave':
                return 'early';

            case 'Incomplete':
                return 'incomplete';

            default:
                return 'unknown';
        }
    };

    /*
        Clear all filters.
    */

    const clearFilters = () => {

        setSearch('');
        setStatusFilter('All');
        setFromDate('');
        setToDate('');
    };

    /*
        Logout.
    */

    const handleLogout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('employee');

        navigate('/login');
    };

    return (

        <div className="dashboard-layout">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="sidebar">

                {/* LOGO */}

                <div className="sidebar-logo">

                    <div className="logo-icon">
                        A
                    </div>

                    <div>

                        <h2>
                            AMS
                        </h2>

                        <span>
                            Attendance System
                        </span>

                    </div>

                </div>


                {/* NAVIGATION */}

                <nav className="sidebar-nav">

                    {/* DASHBOARD */}

                    <Link
                        to="/employee/dashboard"
                        className="nav-item"
                    >

                        <span>
                            ▣
                        </span>

                        Dashboard

                    </Link>


                    {/* MY ATTENDANCE */}

                    <Link
                        to="/employee/attendance"
                        className="nav-item active"
                    >

                        <span>
                            ◷
                        </span>

                        My Attendance

                    </Link>


                    {/* PROFILE */}

                    <div
                        className="nav-item"
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                            navigate('/employee/profile')
                        }
                        onKeyDown={(event) => {

                            if (
                                event.key === 'Enter' ||
                                event.key === ' '
                            ) {
                                navigate('/employee/profile');
                            }

                        }}
                    >

                        <span>
                            👤
                        </span>

                        Profile

                    </div>

                </nav>


                {/* LOGOUT */}

                <div className="sidebar-bottom">

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >

                        <span>
                            ↪
                        </span>

                        Logout

                    </button>

                </div>

            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="main-content">

                {/* TOPBAR */}

                <header className="topbar">

                    <div>

                        <h1>
                            My Attendance
                        </h1>

                        <p>
                            View and track your attendance history
                        </p>

                    </div>


                    {/* USER PROFILE */}

                    <div className="user-profile">

                        <div className="avatar">

                            {employee?.Name
                                ?.charAt(0)
                                ?.toUpperCase()}

                        </div>

                        <div className="user-details">

                            <strong>
                                {employee?.Name}
                            </strong>

                            <span>
                                {employee?.Role}
                            </span>

                        </div>

                    </div>

                </header>


                {/* =========================
                    FILTER CARD
                ========================= */}

                <div className="card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Attendance History
                            </h2>

                            <p>
                                Search and filter your attendance records
                            </p>

                        </div>

                    </div>


                    <div className="attendance-filters">

                        {/* SEARCH */}

                        <div className="filter-group">

                            <label>
                                Search Date
                            </label>

                            <input
                                type="text"
                                placeholder="YYYY-MM-DD"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* FROM DATE */}

                        <div className="filter-group">

                            <label>
                                From Date
                            </label>

                            <input
                                type="date"
                                value={fromDate}
                                onChange={(event) =>
                                    setFromDate(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* TO DATE */}

                        <div className="filter-group">

                            <label>
                                To Date
                            </label>

                            <input
                                type="date"
                                value={toDate}
                                onChange={(event) =>
                                    setToDate(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {/* STATUS */}

                        <div className="filter-group">

                            <label>
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="All">
                                    All
                                </option>

                                <option value="Present">
                                    Present
                                </option>

                                <option value="Late">
                                    Late
                                </option>

                                <option value="Early Leave">
                                    Early Leave
                                </option>

                                <option value="Incomplete">
                                    Incomplete
                                </option>

                            </select>

                        </div>


                        {/* CLEAR */}

                        <button
                            className="clear-filter-button"
                            onClick={clearFilters}
                        >

                            Clear

                        </button>

                    </div>

                </div>


                {/* =========================
                    ATTENDANCE RECORDS
                ========================= */}

                <div className="card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Records
                            </h2>

                            <p>

                                {filteredAttendance.length}

                                {' '}

                                attendance record(s)

                            </p>

                        </div>

                    </div>


                    {/* LOADING */}

                    {loading && (

                        <div className="attendance-message">

                            Loading attendance...

                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div className="attendance-error">

                            {error}

                        </div>

                    )}


                    {/* NO RECORDS */}

                    {!loading &&
                        !error &&
                        filteredAttendance.length === 0 && (

                            <div className="attendance-message">

                                No attendance records found.

                            </div>

                        )
                    }


                    {/* TABLE */}

                    {!loading &&
                        !error &&
                        filteredAttendance.length > 0 && (

                            <div className="table-container">

                                <table>

                                    <thead>

                                        <tr>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Check In
                                            </th>

                                            <th>
                                                Check Out
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredAttendance.map(
                                            (record) => (

                                                <tr
                                                    key={
                                                        record.Attendance_id
                                                    }
                                                >

                                                    <td>

                                                        {formatDate(
                                                            record.Attendance_Date
                                                        )}

                                                    </td>

                                                    <td>

                                                        {formatTime(
                                                            record.In_time
                                                        )}

                                                    </td>

                                                    <td>

                                                        {formatTime(
                                                            record.Out_time
                                                        )}

                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                `status-badge ${getStatusClass(
                                                                    record.Status
                                                                )}`
                                                            }
                                                        >

                                                            {record.Status}

                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                </div>

            </main>

        </div>
    );
}

export default MyAttendance;