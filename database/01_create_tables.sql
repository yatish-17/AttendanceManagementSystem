IF DB_ID(N'AttendanceDB') IS NULL
BEGIN
    CREATE DATABASE AttendanceDB;
END;
GO

USE AttendanceDB;
GO

IF OBJECT_ID(N'dbo.Departments', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Departments
    (
        Department_id INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_Departments PRIMARY KEY,
        Department_name NVARCHAR(100) NOT NULL
            CONSTRAINT UQ_Departments_Department_name UNIQUE
    );
END;
GO

IF OBJECT_ID(N'dbo.Employees', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Employees
    (
        Employee_id INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_Employees PRIMARY KEY,
        Employee_code NVARCHAR(50) NOT NULL
            CONSTRAINT UQ_Employees_Employee_code UNIQUE,
        Name NVARCHAR(150) NOT NULL,
        Email NVARCHAR(254) NOT NULL
            CONSTRAINT UQ_Employees_Email UNIQUE,
        Role NVARCHAR(20) NOT NULL
            CONSTRAINT CK_Employees_Role CHECK (Role IN (N'Admin', N'Employee')),
        Department_id INT NULL,
        Joining_Date DATE NOT NULL
            CONSTRAINT DF_Employees_Joining_Date DEFAULT (CONVERT(date, GETDATE())),
        Password_hash NVARCHAR(255) NOT NULL,
        Is_Active BIT NOT NULL
            CONSTRAINT DF_Employees_Is_Active DEFAULT (1),
        CONSTRAINT FK_Employees_Departments
            FOREIGN KEY (Department_id) REFERENCES dbo.Departments(Department_id)
    );
END;
GO

IF OBJECT_ID(N'dbo.Attendance', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Attendance
    (
        Attendance_id INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_Attendance PRIMARY KEY,
        Employee_id INT NOT NULL,
        Attendance_Date DATE NOT NULL,
        In_time TIME(0) NOT NULL,
        Out_time TIME(0) NULL,
        Status NVARCHAR(30) NOT NULL,
        CONSTRAINT FK_Attendance_Employees
            FOREIGN KEY (Employee_id) REFERENCES dbo.Employees(Employee_id),
        CONSTRAINT UQ_Attendance_Employee_Date UNIQUE (Employee_id, Attendance_Date)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Attendance')
      AND name = N'IX_Attendance_Attendance_Date'
)
BEGIN
    CREATE INDEX IX_Attendance_Attendance_Date
        ON dbo.Attendance(Attendance_Date);
END;
GO
