import {
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import BarangaySignup from "./pages/BarangaySignup";
import DashboardLayout from "./layouts/DashboardLayout";

import SystemDashboard from "./pages/SystemDashboard";
import BarangayDashboard from "./pages/BarangayDashboard";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/signup/barangay-admin"
        element={<BarangaySignup />}
      />

      <Route
        element={<DashboardLayout />}
      >
        <Route
          path="/system/dashboard"
          element={<SystemDashboard />}
        />

        <Route
          path="/barangay/dashboard"
          element={<BarangayDashboard />}
        />
      </Route>

    </Routes>
  );
}

export default App;
