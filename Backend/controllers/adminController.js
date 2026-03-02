const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2️⃣ Check admin exists
    const [admins] = await db.query(
      "SELECT * FROM admins WHERE email = ? LIMIT 1",
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const admin = admins[0];

    // 3️⃣ Password verify
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      {
        adminId: admin.id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5️⃣ Ensure single active session (BEST PRACTICE)
    await db.query(
      "DELETE FROM adminverify WHERE admin_id = ?",
      [admin.id]
    );

    await db.query(
      "INSERT INTO adminverify (admin_id, token) VALUES (?, ?)",
      [admin.id, token]
    );

    // 6️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
exports.adminLogout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    await db.query(
      "DELETE FROM adminverify WHERE token = ?",
      [token]
    );

    res.json({
      success: true,
      message: "Admin logged out successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};
/**
* ============================
 * ADMIN : Assign Task (POST)
 * ============================
 */
exports.createTask = async (req, res) => {
  try {
    const { employee_id, task_title } = req.body;

    if (!employee_id || !task_title) {
      return res.status(400).json({
        success: false,
        message: "employee_id and task_title are required",
      });
    }

    const sql = `
      INSERT INTO tasks (employee_id, task_title,start_date, end_date)
      VALUES (?, ?, ?, ?)
    `;

    await db.query(sql, [employee_id, task_title, req.body.start_date, req.body.end_date]);

    res.status(201).json({
      success: true,
      message: "Task assigned successfully",
    });
  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ success: false });
  }
};

// admin get task status

exports.getTasksByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const sql = `
      SELECT id, task_title,start_date,
        end_date, status, created_at
      FROM tasks
      WHERE employee_id = ?
      ORDER BY created_at DESC
    `;

    const [results] = await db.query(sql, [employeeId]);

    res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({ success: false });
  }
};

// get all leaves of employee by admin
exports.getAllLeaves = async (req, res) => {
  try {
    const sql = `
      SELECT l.id, e.name, e.emp_code, l.type, l.date, l.status, l.remark
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      ORDER BY l.created_at DESC
    `;

    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

//approve or reject leave by admin

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, remark } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const sql = `
      UPDATE leaves
      SET status = ?, remark = ?
      WHERE id = ?
    `;

    await db.query(sql, [status, remark, leaveId]);

    res.json({ success: true, message: "Leave updated" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// GET /admin/employees
exports.getEmployeesForSalary = async (req, res) => {
  try {
    const sql = `
      SELECT id, emp_code, name
      FROM employees
      ORDER BY name ASC
    `;
    const [rows] = await db.query(sql);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// DELETE /admin/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Check if employee exists
    const [existing] = await db.query(
      "SELECT id FROM employees WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Delete employee
    await db.query("DELETE FROM employees WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /admin/salary
exports.addSalary = async (req, res) => {
  try {
    const { employee_id, month, amount, status } = req.body;

    if (!employee_id || !month || !amount) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const sql = `
      INSERT INTO salaries (employee_id, month, amount, status)
      VALUES (?, ?, ?, ?)
    `;

    await db.query(sql, [
      employee_id,
      month,
      amount,
      status || "Pending",
    ]);

    res.json({
      success: true,
      message: "Salary added successfully",
    });
  } catch (err) {
    console.error("Add Salary Error:", err);
    res.status(500).json({ success: false });
  }
};

exports.getAllSalaries = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id,
        e.emp_code,
        e.name,
        s.amount,
        s.month,
        s.status
      FROM salaries s
      JOIN employees e ON s.employee_id = e.id
      ORDER BY s.id DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

