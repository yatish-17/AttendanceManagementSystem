import {
    BrowserRouter,
    Routes,
    Route
} from 'react-router-dom';

import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyAttendance from './pages/MyAttendance';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import AdminAttendance from './pages/AdminAttendance';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Login */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Employee Dashboard */}
                <Route
                    path="/employee/dashboard"
                    element={
                        <ProtectedRoute allowedRole="Employee">
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Employee Attendance */}
                <Route
                    path="/employee/attendance"
                    element={
                        <ProtectedRoute allowedRole="Employee">
                            <MyAttendance />
                        </ProtectedRoute>
                    }
                />

                {/* Employee Profile */}
                <Route
                    path="/employee/profile"
                    element={
                        <ProtectedRoute allowedRole="Employee">
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRole="Admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Employee Management */}
                <Route
                    path="/admin/employees"
                    element={
                        <ProtectedRoute allowedRole="Admin">
                            <EmployeeManagement />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Attendance */}
                <Route
                    path="/admin/attendance"
                    element={
                        <ProtectedRoute allowedRole="Admin">
                            <AdminAttendance />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Reports */}
                <Route
                    path="/admin/reports"
                    element={
                        <ProtectedRoute allowedRole="Admin">
                            <AdminReports />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Settings */}
                <Route
                    path="/admin/settings"
                    element={
                        <ProtectedRoute allowedRole="Admin">
                            <AdminSettings />
                        </ProtectedRoute>
                    }
                />

                {/* Unknown URL */}
                <Route
                    path="*"
                    element={<Login />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;