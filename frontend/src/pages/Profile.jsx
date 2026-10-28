import { useNavigate, Link } from 'react-router-dom';

import './Profile.css';

function Profile() {
    const navigate = useNavigate();

    const employee = JSON.parse(
        localStorage.getItem('employee')
    );

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('employee');

        navigate('/login');
    };

    const formatDate = (date) => {
        if (!date) {
            return '-';
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

    return (
        <div className="dashboard-layout">

            <aside className="sidebar">

                <div className="sidebar-logo">

                    <div className="logo-icon">
                        A
                    </div>

                    <div>
                        <h2>AMS</h2>

                        <span>
                            Attendance System
                        </span>
                    </div>

                </div>

                <nav className="sidebar-nav">

                    <Link
                        to="/employee/dashboard"
                        className="nav-item"
                    >
                        <span>▣</span>
                        Dashboard
                    </Link>

                    <Link
                        to="/employee/attendance"
                        className="nav-item"
                    >
                        <span>◷</span>
                        My Attendance
                    </Link>

                    <Link
                        to="/employee/profile"
                        className="nav-item active"
                    >
                        <span>👤</span>
                        Profile
                    </Link>

                </nav>

                <div className="sidebar-bottom">

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            <main className="main-content">

                <header className="topbar">

                    <div>
                        <h1>Profile</h1>

                        <p>
                            View your employee information
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

                <section className="profile-card">

                    <div className="profile-header">

                        <div className="profile-avatar">
                            {employee?.Name
                                ?.charAt(0)
                                ?.toUpperCase()}
                        </div>

                        <div>

                            <h2>
                                {employee?.Name}
                            </h2>

                            <p>
                                {employee?.Role}
                            </p>

                        </div>

                    </div>

                    <div className="profile-divider"></div>

                    <div className="profile-section">

                        <div className="section-title">

                            <h3>
                                Employee Information
                            </h3>

                            <p>
                                Your account and employment details
                            </p>

                        </div>

                        <div className="profile-grid">

                            <div className="profile-field">

                                <label>
                                    Employee Code
                                </label>

                                <div className="profile-value">
                                    {employee?.Employee_code || '-'}
                                </div>

                            </div>

                            <div className="profile-field">

                                <label>
                                    Full Name
                                </label>

                                <div className="profile-value">
                                    {employee?.Name || '-'}
                                </div>

                            </div>

                            <div className="profile-field">

                                <label>
                                    Email
                                </label>

                                <div className="profile-value">
                                    {employee?.Email || '-'}
                                </div>

                            </div>

                            <div className="profile-field">

                                <label>
                                    Role
                                </label>

                                <div className="profile-value">
                                    {employee?.Role || '-'}
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="profile-divider"></div>

                    <div className="profile-section">

                        <div className="section-title">

                            <h3>
                                Account
                            </h3>

                            <p>
                                Current account information
                            </p>

                        </div>

                        <div className="profile-grid">

                            <div className="profile-field">

                                <label>
                                    Account Status
                                </label>

                                <div className="profile-value">

                                    <span className="active-badge">
                                        Active
                                    </span>

                                </div>

                            </div>

                            <div className="profile-field">

                                <label>
                                    Employee ID
                                </label>

                                <div className="profile-value">
                                    {employee?.Employee_id || '-'}
                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="profile-note">

                        <strong>
                            Profile information
                        </strong>

                        <p>
                            Some account information can only
                            be changed by an administrator.
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Profile;