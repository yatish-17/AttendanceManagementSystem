import { useEffect, useState } from 'react';

import {
    useNavigate,
    Link
} from 'react-router-dom';

import {
    getMyAttendance,
    checkIn,
    checkOut
} from '../services/api';

import './EmployeeDashboard.css';

function EmployeeDashboard() {

    const navigate = useNavigate();

    const employee = JSON.parse(
        localStorage.getItem('employee')
    );

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

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

        } catch (error) {

            console.error(
                'Attendance loading error:',
                error
            );

            setError(
                'Unable to load attendance'
            );

        } finally {

            setLoading(false);
        }
    };

    /*
        Find today's attendance record.
    */

    const getTodayAttendance = () => {

        const today = new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, '0');

        const day =
            String(
                today.getDate()
            ).padStart(2, '0');

        const todayString =
            `${year}-${month}-${day}`;

        return attendance.find(
            (record) =>
                String(record.Attendance_Date)
                    .substring(0, 10) === todayString
        );
    };

    const todayAttendance =
        getTodayAttendance();

    /*
        Format time for display.
    */

    const formatTime = (time) => {

        if (!time) {
            return '--:--';
        }

        const parts =
            String(time).split(':');

        if (parts.length < 2) {
            return time;
        }

        let hours =
            Number(parts[0]);

        const minutes =
            parts[1];

        const period =
            hours >= 12
                ? 'PM'
                : 'AM';

        hours =
            hours % 12 || 12;

        return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
    };

    /*
        Format today's date.
    */

    const formatTodayDate = () => {

        return new Date().toLocaleDateString(
            'en-US',
            {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
            }
        );
    };

    /*
        Format attendance date.
    */

    const formatDate = (date) => {

        if (!date) {
            return '--';
        }

        const dateString =
            String(date).substring(0, 10);

        const [
            year,
            month,
            day
        ] = dateString.split('-');

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
        Logout.
    */

    const handleLogout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('employee');

        navigate('/login');
    };

    /*
        Check In.
    */

    const handleCheckIn = async () => {

        try {

            setActionLoading(true);
            setActionError('');

            const { response, data } =
                await checkIn();

            if (!response.ok) {

                setActionError(
                    data.message ||
                    'Check-in failed'
                );

                return;
            }

            await loadAttendance();

        } catch (error) {

            console.error(
                'Check-in error:',
                error
            );

            setActionError(
                'Unable to complete check-in'
            );

        } finally {

            setActionLoading(false);
        }
    };

    /*
        Check Out.
    */

    const handleCheckOut = async () => {

        try {

            setActionLoading(true);
            setActionError('');

            const { response, data } =
                await checkOut();

            if (!response.ok) {

                setActionError(
                    data.message ||
                    'Check-out failed'
                );

                return;
            }

            await loadAttendance();

        } catch (error) {

            console.error(
                'Check-out error:',
                error
            );

            setActionError(
                'Unable to complete check-out'
            );

        } finally {

            setActionLoading(false);
        }
    };

    return (

        <div className="dashboard-layout">

            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="sidebar">

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

                <nav className="sidebar-nav">

                    {/* DASHBOARD */}

                    <Link
                        to="/employee/dashboard"
                        className="nav-item active"
                    >

                        <span>
                            ▣
                        </span>

                        Dashboard

                    </Link>

                    {/* MY ATTENDANCE */}

                    <Link
                        to="/employee/attendance"
                        className="nav-item"
                    >

                        <span>
                            ◷
                        </span>

                        My Attendance

                    </Link>

                    {/* PROFILE */}

                    <Link
                        to="/employee/profile"
                        className="nav-item"
                    >

                        <span>
                            👤
                        </span>

                        Profile

                    </Link>

                </nav>

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
                            Dashboard
                        </h1>

                        <p>
                            Manage your attendance and view your activity.
                        </p>

                    </div>

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


                {/* WELCOME SECTION */}

                <section className="welcome-section">

                    <div>

                        <h2>

                            {new Date().getHours() < 12
                                ? 'Good morning'
                                : new Date().getHours() < 17
                                    ? 'Good afternoon'
                                    : 'Good evening'
                            },{' '}

                            {employee?.Name?.split(' ')[0]} 👋

                        </h2>

                        <p>
                            Here's your attendance overview for today.
                        </p>

                    </div>

                </section>


                {/* ATTENDANCE CARDS */}

                <section className="stats-grid">

                    {/* CHECK IN */}

                    <div className="stat-card">

                        <div className="stat-icon checkin-icon">
                            ↗
                        </div>

                        <div>

                            <span>
                                Check In
                            </span>

                            <h3>

                                {formatTime(
                                    todayAttendance?.In_time
                                )}

                            </h3>

                        </div>

                    </div>


                    {/* CHECK OUT */}

                    <div className="stat-card">

                        <div className="stat-icon checkout-icon">
                            ↙
                        </div>

                        <div>

                            <span>
                                Check Out
                            </span>

                            <h3>

                                {formatTime(
                                    todayAttendance?.Out_time
                                )}

                            </h3>

                        </div>

                    </div>


                    {/* STATUS */}

                    <div className="stat-card">

                        <div className="stat-icon status-icon">
                            ✓
                        </div>

                        <div>

                            <span>
                                Today's Status
                            </span>

                            <h3 className="status-text">

                                {todayAttendance?.Status ||
                                    'Not Marked'}

                            </h3>

                        </div>

                    </div>

                </section>


                {/* TODAY'S ATTENDANCE */}

                <section className="attendance-action card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Today's Attendance
                            </h2>

                            <p>
                                Record your attendance for today.
                            </p>

                        </div>

                        <span className="date-badge">

                            {formatTodayDate()}

                        </span>

                    </div>

                    <div className="attendance-buttons">

                        {/* CHECK IN */}

                        <button
                            className="checkin-button"
                            onClick={handleCheckIn}
                            disabled={
                                actionLoading ||
                                !!todayAttendance
                            }
                        >

                            <span>
                                ↗
                            </span>

                            {actionLoading
                                ? 'Processing...'
                                : todayAttendance
                                    ? 'Checked In'
                                    : 'Check In'
                            }

                        </button>


                        {/* CHECK OUT */}

                        <button
                            className="checkout-button"
                            onClick={handleCheckOut}
                            disabled={
                                actionLoading ||
                                !todayAttendance ||
                                !!todayAttendance?.Out_time
                            }
                        >

                            <span>
                                ↙
                            </span>

                            {actionLoading
                                ? 'Processing...'
                                : todayAttendance?.Out_time
                                    ? 'Checked Out'
                                    : 'Check Out'
                            }

                        </button>

                    </div>

                    {actionError && (

                        <div className="attendance-error">

                            {actionError}

                        </div>

                    )}

                </section>


                {/* RECENT ATTENDANCE */}

                <section className="card">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Recent Attendance
                            </h2>

                            <p>
                                Your latest attendance records.
                            </p>

                        </div>

                        <Link
                            to="/employee/attendance"
                            className="view-all-button"
                        >
                            View All
                        </Link>

                    </div>

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

                                {/* LOADING */}

                                {loading && (

                                    <tr>

                                        <td colSpan="4">
                                            Loading attendance...
                                        </td>

                                    </tr>

                                )}


                                {/* ERROR */}

                                {!loading &&
                                    error && (

                                        <tr>

                                            <td colSpan="4">
                                                {error}
                                            </td>

                                        </tr>

                                    )
                                }


                                {/* NO RECORDS */}

                                {!loading &&
                                    !error &&
                                    attendance.length === 0 && (

                                        <tr>

                                            <td colSpan="4">
                                                No attendance records found.
                                            </td>

                                        </tr>

                                    )
                                }


                                {/* ATTENDANCE RECORDS */}

                                {!loading &&
                                    !error &&
                                    attendance
                                        .slice(0, 5)
                                        .map((record) => (

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

                                        ))
                                }

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default EmployeeDashboard;