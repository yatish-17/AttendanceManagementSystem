const sql = require('mssql/msnodesqlv8');

const config = {
    server: 'localhost',
    database: 'AttendanceDB',
    options: {
        trustedConnection: true,
        trustServerCertificate: true
    },
   driver: 'ODBC Driver 18 for SQL Server'
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('SQL Server connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
};

module.exports = { sql, connectDB };