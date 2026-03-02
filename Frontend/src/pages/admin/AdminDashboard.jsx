import React, { useEffect, useState } from "react";
import "../../styles/AdminDashboard.css";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../api/axios";

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [remark, setRemark] = useState({});
  const [alert, setAlert] = useState(null);

  // ==========================
  // FETCH EMPLOYEES (✅ GLOBAL)
  // ==========================
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employee/all");

      if (res.data.success && Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Fetch employees error:", error);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ==========================
  // FETCH LEAVES
  // ==========================
  const fetchLeaves = async () => {
    try {
      const res = await api.get("/employee/leaves/all");
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err) {
      console.error("Fetch leaves error:", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

    // ========================== FETCH ATTENDANCE ==========================
  const fetchAttendance = async () => {
    try {
      const res = await api.get("/employee/attendance/all"); // new endpoint
      if (res.data.success) setAttendance(res.data.data);
    } catch (err) {
      console.error("Fetch attendance error:", err);
    }
  };
  useEffect(() => {
    fetchAttendance();
  }, []);

  // ==========================
  // UPDATE LEAVE STATUS
  // ==========================
  const updateLeave = async (leaveId, status) => {
    try {
      await api.put(`/employee/${leaveId}`, {
        status,
        remark: remark[leaveId] || "",
      });

      setAlert({
        type: "success",
        message: "Leave updated successfully!",
      });

      fetchLeaves();

      setTimeout(() => {
        setAlert(null);
      }, 1000);

    } catch (err) {
      console.error("Update leave error:", err);

      setAlert({
        type: "error",
        message: "Failed to update leave!",
      });

      setTimeout(() => {
        setAlert(null);
      }, 1000);
    }
  };

// delete employee
 const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this employee?")) return;

  try {
    await api.delete(`/admin/employees/${id}`);

    setAlert({
      type: "success",
      message: "Employee deleted successfully",
    });

    fetchEmployees(); // ✅ NOW WORKS

    setTimeout(() => setAlert(null), 1500);
  } catch (err) {
    console.error(err);

    setAlert({
      type: "error",
      message: "Failed to delete employee",
    });

    setTimeout(() => setAlert(null), 1500);
  }
};




  
  // ========================== PRESENT COUNT ==========================
  const presentCount = attendance.filter(a => a.attendance_type === "Present").length; 

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar />

      <main className="adm-main-content">
        <header>
          <h1>Welcome Admin</h1>
        </header>

        {/* ================= ALERT ================= */}
        {alert && (
          <div className={`alert ${alert.type}`}>
            {alert.message}
          </div>
        )}

        {/* ================= STATS ================= */}
        <div className="adm-stats-grid">
          <div className="adm-stat-card">
            <span>Total Employees</span>
            <span>{employees.length}</span>
          </div>

          <div
            className="adm-stat-card"
            style={{ borderLeftColor: "#f59e0b" }}
          >
            <span>Pending Leaves</span>
            <span>
              {leaves.filter((l) => l.status === "Pending").length}
            </span>
          </div>

          <div
            className="adm-stat-card"
            style={{ borderLeftColor: "#10b981" }}
          >
            <span>Total Leaves</span>
            <span>{leaves.length}</span>
          </div>

          <div className="adm-stat-card" style={{ borderLeftColor: "#3b82f6" }}>
            <span>Present Today</span>
            <span>{presentCount}</span>
          </div>
        </div>

        {/* ================= EMPLOYEE TABLE ================= */}
        <div className="adm-table-container">
          <h2>Recent Employees</h2>

          <table className="adm-table">
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.emp_code || "-"}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>
    <button
      className="delete-btn"
      onClick={() => handleDelete(emp.id)}
    >
      Remove
    </button>
  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= LEAVE REQUEST TABLE ================= */}
        <div className="adm-table-container">
          <h2>Leave Requests</h2>

          <table className="adm-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remark</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.name}</td>
                    <td>{leave.type}</td>
                    <td>{leave.date}</td>
                    <td>
                      <span
                        className={`badge ${leave.status.toLowerCase()}`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td>
                      <input
                        placeholder="Remark"
                        value={remark[leave.id] || ""}
                        onChange={(e) =>
                          setRemark((prev) => ({
                            ...prev,
                            [leave.id]: e.target.value,
                          }))
                        }
                      />
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          updateLeave(leave.id, "Approved")
                        }
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateLeave(leave.id, "Rejected")
                        }
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= ATTENDANCE TABLE ================= */}
        <div className="adm-table-container">
          <h2>Attendance</h2>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Name</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>No attendance data</td>
                </tr>
              ) : (
                attendance.map((a, idx) => (
                  <tr key={idx}>
                    <td>{a.emp_code}</td>
                    <td>{a.name}</td>
                    <td>{a.date}</td>
                    <td>{a.check_in || "-"}</td>
                    <td>{a.check_out || "-"}</td>
                    <td>{a.attendance_type || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
