import {
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import BarangaySignup from "./pages/BarangaySignup";
import DashboardLayout from "./layouts/DashboardLayout";

import SystemDashboard from "./pages/SystemDashboard";
import BarangayDashboard from "./pages/BarangayDashboard";
import Residents from "./pages/Residents";
import Certificates from "./pages/Certificates";
import Officials from "./pages/Officials";
import Settings from "./pages/Settings";
import ResidentProfile from "./pages/ResidentProfile";
import AddResident from "./pages/AddResident";
import AddOfficial from "./pages/AddOfficials";
import CertificateResidentSelect from "./pages/CertificateResidentSelect";
import CertificateGeneration from "./pages/CertificateGeneration";


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

        <Route
          path="/barangay/residents"
          element={<Residents />}
        />

        <Route
          path="/barangay/residents/:residentId"
          element={<ResidentProfile />}
        />

        <Route
          path="/barangay/residents/new"
          element={<AddResident />}
        />  

        <Route
          path="/barangay/certificates"
          element={<Certificates />}
        />

        <Route
          path="/barangay/certificates/new/:certificateType"
          element={<CertificateResidentSelect />}
        />

        <Route
          path="/barangay/certificates/new/:certificateType/:residentId"
          element={<CertificateGeneration />}
        />

        <Route
          path="/barangay/officials"
          element={<Officials />}
        />

        <Route
          path="/barangay/officials/new"
          element={<AddOfficial />}
        />

        <Route
          path="/barangay/officials/:officialId"
          element={<AddOfficial />}
        />

        <Route
          path="/barangay/settings"
          element={<Settings />}
        />

      </Route>

    </Routes>
  );
}

export default App;
