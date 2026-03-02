// import axios from "axios";

// const api = axios.create({ baseURL: "http://localhost:5001/api",
// headers: { "Content-Type": "application/json" }, });

// api.interceptors.request.use((config) => {
//   const adminToken = localStorage.getItem("adminToken");
//   const employeeToken = localStorage.getItem("employeeToken");

//   // 🔥 ADMIN LOGGED IN → ADMIN TOKEN ALWAYS PREFERRED
//   if (adminToken) {
//     config.headers.Authorization = `Bearer ${adminToken}`;
//   }
//   // ELSE EMPLOYEE
//   else if (employeeToken) {
//     config.headers.Authorization = `Bearer ${employeeToken}`;
//   }

//   return config;
// });

// export default api;

//above commented code is locally run this website then below are 
//hosted on render when require locally then remove below code commented and 
//.env frontend also commenmted

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const employeeToken = localStorage.getItem("employeeToken");

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (employeeToken) {
    config.headers.Authorization = `Bearer ${employeeToken}`;
  }

  return config;
});

export default api;


