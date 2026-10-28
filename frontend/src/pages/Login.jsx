import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
    const navigate = useNavigate();

    const [employeeCode, setEmployeeCode] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();

        setError('');

        try {
            const response = await fetch(
                'http://localhost:5000/api/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        Employee_code: employeeCode,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Login failed');
                return;
            }

            localStorage.setItem('token', data.token);

            localStorage.setItem(
                'employee',
                JSON.stringify(data.employee)
            );

            if (data.employee.Role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/employee/dashboard');
            }

        } catch (error) {
            console.error('Login error:', error);

            setError(
                'Unable to connect to the server'
            );
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* Logo */}
                <div className="login-brand">

                    <div className="login-logo">
                        A
                    </div>

                    <h1>AMS</h1>

                    <p>
                        Attendance Management System
                    </p>

                </div>


                {/* Heading */}
                <div className="login-heading">

                    <h2>Welcome Back</h2>

                    <p>
                        Sign in to access your account
                    </p>

                </div>


                {/* Login Form */}
                <form onSubmit={handleLogin}>

                    <div className="form-group">

                        <label htmlFor="employeeCode">
                            Employee Code
                        </label>

                        <input
                            id="employeeCode"
                            type="text"
                            placeholder="Enter employee code"
                            value={employeeCode}
                            onChange={(event) =>
                                setEmployeeCode(event.target.value)
                            }
                            autoComplete="username"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="current-password"
                            required
                        />

                    </div>


                    {/* Error */}
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}


                    <button
                        type="submit"
                        className="login-button"
                    >
                        Sign In
                    </button>

                </form>


                {/* Footer */}
                <div className="login-footer">

                    <span>
                        Employee Attendance Management System
                    </span>

                    <span>
                        Secure Employee Portal
                    </span>

                </div>

            </div>

        </div>
    );
}

export default Login;