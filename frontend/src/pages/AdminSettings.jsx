import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import './ComingSoon.css';

function Icon({ type, size = 22 }) {
    const common = {
        width: size, height: size, viewBox: '0 0 24 24',
        fill: 'none', stroke: 'currentColor', strokeWidth: '2',
        strokeLinecap: 'round', strokeLinejoin: 'round'
    };
    const icons = {
        dashboard: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
        employees: (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
        attendance: (<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>),
        reports: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>),
        settings: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>),
        logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
    };
    return <svg {...common}>{icons[type] || icons.dashboard}</svg>;
}


function AdminSettings() {

    const navigate = useNavigate();
    const employeeData = JSON.parse(localStorage.getItem('employee') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
        navigate('/login');
    };

    return (
        <div className="admin-layout">

            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon"><Icon type="dashboard" size={22} /></div>
                    <strong>AttendIQ</strong>
                </div>

                <nav className="sidebar-nav">
                    <button className="sidebar-item" onClick={() => navigate('/admin/dashboard')}>
                        <Icon type="dashboard" size={24} /><span>Dashboard</span>
                    </button>
                    <button className="sidebar-item" onClick={() => navigate('/admin/employees')}>
                        <Icon type="employees" size={24} /><span>Employees</span>
                    </button>
                    <button className="sidebar-item" onClick={() => navigate('/admin/attendance')}>
                        <Icon type="attendance" size={24} /><span>Attendance</span>
                    </button>
                    <button className="sidebar-item" onClick={() => navigate('/admin/reports')}>
                        <Icon type="reports" size={24} /><span>Reports</span>
                    </button>
                    <button className="sidebar-item active">
                        <Icon type="settings" size={24} /><span>Settings</span>
                    </button>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            {employeeData.Name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <strong>{employeeData.Name || 'Admin'}</strong>
                            <span>Administrator</span>
                        </div>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        <Icon type="logout" size={24} /><span>Logout</span>
                    </button>
                </div>
            </aside>


            <main className="main-content">
                <div className="coming-soon-wrapper">

                    <div className="coming-soon-icon settings-cs-icon">
                        <Icon type="settings" size={52} />
                    </div>

                    <h1>System Settings</h1>

                    <p className="coming-soon-subtitle">
                        Configure your organization's attendance system, roles, departments, and more.
                    </p>

                    <div className="coming-soon-features">
                        <div className="cs-feature">
                            <span className="cs-dot upcoming" />
                            <span>Organization profile &amp; branding</span>
                        </div>
                        <div className="cs-feature">
                            <span className="cs-dot upcoming" />
                            <span>Department creation &amp; management</span>
                        </div>
                        <div className="cs-feature">
                            <span className="cs-dot upcoming" />
                            <span>Work shift &amp; office hours configuration</span>
                        </div>
                        <div className="cs-feature">
                            <span className="cs-dot upcoming" />
                            <span>Admin roles &amp; permissions</span>
                        </div>
                        <div className="cs-feature">
                            <span className="cs-dot upcoming" />
                            <span>Notification &amp; alert preferences</span>
                        </div>
                    </div>

                    <div className="coming-soon-actions">
                        <button className="cs-primary-btn" onClick={() => navigate('/admin/dashboard')}>
                            ← Back to Dashboard
                        </button>
                        <button className="cs-secondary-btn" onClick={() => navigate('/admin/employees')}>
                            Manage Employees
                        </button>
                    </div>

                </div>
            </main>

        </div>
    );
}

export default AdminSettings;
