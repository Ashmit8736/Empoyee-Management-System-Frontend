const express = require("express");
const router = express.Router();

const { adminLogin, deleteEmployee } = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");
const db = require("../config/db");

/* =====================================================
   🔓 ADMIN LOGIN
   POST /api/admin/login
===================================================== */
router.post("/login", adminLogin);


/* =====================================================
   🔒 ADMIN DASHBOARD (PROTECTED)
   GET /api/admin/dashboard
===================================================== */
router.get("/dashboard", adminAuth, (req, res) => {  
  res.json({
    success: true,
    message: "Welcome Admin Dashboard",
    admin: req.admin
  });
});

// delete employee by admin

router.delete("/employees/:id", deleteEmployee);



/* =====================================================
   🔴 ADMIN LOGOUT (PROTECTED)
   POST /api/admin/logout
   - token delete from adminverify table
===================================================== */
router.post("/logout", adminAuth, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    await db.query(
      "DELETE FROM adminverify WHERE admin_id = ? AND token = ?",
      [req.admin.adminId, token]
    );

    res.json({
      success: true,
      message: "Admin logged out successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
});

module.exports = router;