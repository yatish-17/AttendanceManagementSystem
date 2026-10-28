const API_BASE_URL = 'http://localhost:5000/api';


/* =========================
   GET AUTH TOKEN
========================= */

const getToken = () => {
    return localStorage.getItem('token');
};


/* =========================
   AUTHENTICATED REQUEST
========================= */

const authenticatedRequest = async (
    url,
    options = {}
) => {

    const token = getToken();

    const response = await fetch(
        url,
        {
            ...options,

            headers: {
                ...(options.headers || {}),

                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    return {
        response,
        data
    };
};


/* =========================
   LOGIN
========================= */

export const loginEmployee = async (
    Employee_code,
    password
) => {

    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                Employee_code,
                password
            })
        }
    );

    const data = await response.json();

    return {
        response,
        data
    };
};


/* =========================
   GET MY ATTENDANCE
========================= */

export const getMyAttendance = async () => {

    return authenticatedRequest(
        `${API_BASE_URL}/attendance`,
        {
            method: 'GET'
        }
    );
};

export const getAllAttendance = async () => {
    return authenticatedRequest(
        `${API_BASE_URL}/attendance`,
        {
            method: 'GET'
        }
    );
};


/* =========================
   CHECK IN
========================= */

export const checkIn = async () => {

    return authenticatedRequest(
        `${API_BASE_URL}/attendance/check-in`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};


/* =========================
   CHECK OUT
========================= */

export const checkOut = async () => {

    return authenticatedRequest(
        `${API_BASE_URL}/attendance/check-out`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
};


/* =========================
   ADMIN DASHBOARD
========================= */

export const getAdminDashboard = async () => {

    return authenticatedRequest(
        `${API_BASE_URL}/dashboard`,
        {
            method: 'GET'
        }
    );
};


/* =========================
   GET ALL EMPLOYEES
========================= */

export const getEmployees = async () => {

    return authenticatedRequest(
        `${API_BASE_URL}/employees`,
        {
            method: 'GET'
        }
    );
};


/* =========================
   GET DEPARTMENTS
========================= */

export const getDepartments = async () => {

    return authenticatedRequest(
        `${API_BASE_URL}/employees/departments`,
        {
            method: 'GET'
        }
    );
};


/* =========================
   ADD EMPLOYEE
========================= */

export const addEmployee = async (
    employeeData
) => {

    return authenticatedRequest(
        `${API_BASE_URL}/employees`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(employeeData)
        }
    );
};


/* =========================
   UPDATE EMPLOYEE
========================= */

export const updateEmployee = async (
    employeeId,
    employeeData
) => {

    return authenticatedRequest(
        `${API_BASE_URL}/employees/${employeeId}`,
        {
            method: 'PUT',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(employeeData)
        }
    );
};


/* =========================
   DISABLE EMPLOYEE
========================= */

export const disableEmployee = async (
    employeeId
) => {

    return authenticatedRequest(
        `${API_BASE_URL}/employees/${employeeId}/disable`,
        {
            method: 'PATCH'
        }
    );
};


/* =========================
   REACTIVATE EMPLOYEE
========================= */

export const reactivateEmployee = async (
    employeeId
) => {

    return authenticatedRequest(
        `${API_BASE_URL}/employees/${employeeId}/reactivate`,
        {
            method: 'PATCH'
        }
    );
};