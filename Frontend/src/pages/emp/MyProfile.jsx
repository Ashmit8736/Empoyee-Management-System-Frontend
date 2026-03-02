// import EmployeeSidebar from "../../components/EmployeeSidebar";
// import "../../styles/MyProfile.css";
// import api from "../api/axios";
// import { useState, useEffect } from "react";


// const MyProfile = () => {
//   const [profile, setProfile] = useState(null);
//     useEffect(() => {
//       const fetchProfile = async () => {
//         try {
//           const res = await api.get("/employee/profile") ;
//             setProfile(res.data.data);
//         } catch (error) {
//           console.error("Failed to fetch profile:", error);
//           alert("Error fetching profile");
//         }
//       };
//       fetchProfile();
//     }, []);
//     if (!profile) {
//       return <div>Loading...</div>;
//     } 

//   return (
//     <div className="emp-dashboard-layout">
//       {/* Sidebar */}
//       <EmployeeSidebar />

//       {/* Main Content */}
//       <main className="emp-main-content">
//         <div className="profile-page">
//           <div className="profile-card">
//             <h2>My Profile</h2>

//             <div className="profile-row">
//               <span>Name</span>
//               <p>{profile?.name}</p>
//             </div>

//             <div className="profile-row">
//               <span>Email</span>
//               <p>{profile?.email}</p>
//             </div>

//             <div className="profile-row">
//               <span>Department</span>
//               <p>{profile.department || "Pending"}</p>
//             </div>

//             <div className="profile-row">
//               <span>Role</span>
//               <p>Employee</p>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default MyProfile;

import EmployeeSidebar from "../../components/EmployeeSidebar";
import "../../styles/MyProfile.css";
import api from "../api/axios";
import { useState, useEffect } from "react";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/employee/profile");
        setProfile(res.data?.data || null);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("No employee found");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="emp-dashboard-layout">
      {/* Sidebar hamesha rahe */}
      <EmployeeSidebar />

      {/* Main Content */}
      <main className="emp-main-content">
        <div className="profile-page">
          <div className="profile-card">
            <h2>My Profile</h2>

            {/* Loading State */}
            {loading && <p>Loading...</p>}

            {/* Error State */}
            {!loading && error && (
              <p style={{ color: "red", textAlign: "center" }}>
                {error}
              </p>
            )}

            {/* Profile Data */}
            {!loading && !error && profile && (
              <>
                <div className="profile-row">
                  <span>Name</span>
                  <p>{profile.name}</p>
                </div>

                <div className="profile-row">
                  <span>Email</span>
                  <p>{profile.email}</p>
                </div>

                <div className="profile-row">
                  <span>Department</span>
                  <p>{profile.department || "Pending"}</p>
                </div>

                <div className="profile-row">
                  <span>Role</span>
                  <p>Employee</p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyProfile;

