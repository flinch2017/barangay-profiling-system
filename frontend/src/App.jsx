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
import ClaimRequests from "./pages/ClaimRequests";
import ResidentPortal from "./pages/ResidentPortal";
import ClaimResidentProfile from "./pages/ClaimResidentProfile";
import ResidentNotifications from "./pages/ResidentNotifications";
import OfficialProfile from "./pages/OfficialProfile";
import Customization from "./pages/Customization";


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
          path="/barangay/residents/:residentId/edit"
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
          element={<OfficialProfile />}
        />

        <Route path="/barangay/officials/:officialId/edit" element={<AddOfficial />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/barangay/customization" element={<Customization />} />

        <Route path="/barangay/claim-requests" element={<ClaimRequests />} />
        <Route path="/resident/portal" element={<ResidentPortal />} />
        <Route path="/resident/claim-profile" element={<ClaimResidentProfile />} />
        <Route path="/resident/register" element={<AddResident />} />
        <Route path="/resident/notifications" element={<ResidentNotifications />} />

      </Route>

    </Routes>
  );
}

export default App;
