import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRole }) {
    const token = localStorage.getItem('token');
    const employeeData = localStorage.getItem('employee');

    if (!token || !employeeData) {
        return <Navigate to="/login" replace />;
    }

    const employee = JSON.parse(employeeData);

    if (allowedRole && employee.Role !== allowedRole) {
        if (employee.Role === 'Admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }

        return <Navigate to="/employee/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;