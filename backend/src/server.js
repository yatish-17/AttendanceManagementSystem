const dashboardRoutes =
    require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const { connectDB } = require('./config/db');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Attendance Management System API is running'
    });
});

connectDB();
app.use(cors());
app.use(express.json());
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.listen(PORT, () =>{
 console.log(`Server running on port ${PORT}`);
});