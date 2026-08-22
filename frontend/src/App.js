import { BrowserRouter, Routes, Route } from "react-router-dom";

/* ================= COMMON ================= */

import Home from "./pages/Home";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import CookiePolicy from "./pages/CookiePolicy";
import CompanyProfiles from "./pages/CompanyProfiles";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

/* ================= ADMIN ================= */

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageJobs from "./pages/ManageJobs";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AddManager from "./pages/AddManager";
import AdminSupportRequests from "./pages/AdminSupportRequests";

/* ================= MANAGER ================= */

import ManagerLayout from "./layouts/ManagerLayout";
import ManagerDashboard from "./pages/ManagerDashboard";
import CreateJob from "./pages/CreateJob";
import TotalJobs from "./pages/TotalJobs";
import EditJob from "./pages/EditJob";
import Applicants from "./pages/Applicants";
import ManagerInterviews from "./pages/ManagerInterviews";
import ScheduleInterview from "./pages/ScheduleInterview";
import Recruiters from "./pages/Recruiters";
import ApprovedJobs from "./pages/ApprovedJobs";
import Profile from "./pages/Profile";
import ManagerReports from "./pages/ManagerReports";
import ManagerSupportRequests from "./pages/ManagerSupportRequests";

/* ================= JOB SEEKER ================= */

import JobSeekerLayout from "./layouts/JobSeekerLayout";
import JobSeeker from "./pages/JobSeeker";
import FindJobs from "./pages/FindJobs";
import SavedJobs from "./pages/SavedJobs";
import Applications from "./pages/Applications";
import JobTracker from "./pages/JobTracker";
import MyInterviews from "./pages/MyInterviews";
import MyResume from "./pages/MyResume";
import SkillAssessment from "./pages/SkillAssessment";
import JobSeekerProfile from "./pages/JobSeekerProfile";
import Notifications from "./pages/Notifications";
import JobSeekerSupport from "./pages/JobSeekerSupport";

/* ================= OTHER ================= */
import JobHolderLayout from "./layouts/JobHolderLayout";
import JobHolder from "./pages/JobHolder";
import JobHolderDashboard from "./pages/JobHolderDashboard";
import JobHolderCreateJob from "./pages/JobHolderCreateJob";
import JobHolderJobs from "./pages/JobHolderJobs";
import JobHolderApplicants from "./pages/JobHolderApplicants";
import JobHolderInterviews from "./pages/JobHolderInterviews";
import JobHolderApprovedJobs from "./pages/JobHolderApprovedJobs";
import JobHolderProfile from "./pages/JobHolderProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            COMMON
        ===================================================== */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />
         <Route
    path="/privacy-policy"
    element={<PrivacyPolicy />}
  />
  <Route
  path="/terms-conditions"
  element={<TermsConditions />}
/>
<Route path="/cookie-policy" element={<CookiePolicy />} />
<Route
  path="/company-profile"
  element={<CompanyProfiles />}
/>

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOTP />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* =====================================================
            ADMIN
        ===================================================== */}

        <Route element={<AdminLayout />}>

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/manage-users"
            element={<ManageUsers />}
          />

          <Route
            path="/manage-jobs"
            element={<ManageJobs />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/add-manager"
            element={<AddManager />}
          />

          {/* ADMIN SUPPORT */}
          <Route
  path="/support-requests"
  element={<AdminSupportRequests />}
/>

        </Route>


        {/* =====================================================
            MANAGER
        ===================================================== */}

        <Route element={<ManagerLayout />}>

          <Route
            path="/manager-dashboard"
            element={<ManagerDashboard />}
          />

          <Route
            path="/create-job"
            element={<CreateJob />}
          />

          <Route
            path="/total-jobs"
            element={<TotalJobs />}
          />

          <Route
            path="/edit-job/:id"
            element={<EditJob />}
          />

          <Route
            path="/applicants"
            element={<Applicants />}
          />
<Route
  path="/manager/interviews"
  element={<ManagerInterviews />}
/>

          <Route
            path="/schedule-interview"
            element={<ScheduleInterview />}
          />

          <Route
            path="/recruiters"
            element={<Recruiters />}
          />

          <Route
            path="/approved-jobs"
            element={<ApprovedJobs />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
          <Route
  path="/manager/reports"
  element={<ManagerReports />}
/>

          {/* MANAGER SUPPORT */}
          <Route
            path="/manager-support"
            element={<ManagerSupportRequests />}
          />

        </Route>


        {/* =====================================================
            JOB SEEKER
        ===================================================== */}

        <Route
          path="/job-seeker"
          element={<JobSeekerLayout />}
        >

          <Route
            index
            element={<JobSeeker />}
          />

          <Route
            path="find-jobs"
            element={<FindJobs />}
          />

          <Route
            path="saved-jobs"
            element={<SavedJobs />}
          />

          <Route
            path="applications"
            element={<Applications />}
          />
          <Route
  path="job-tracker"
  element={<JobTracker />}
/>
       
          <Route
            path="interviews"
            element={<MyInterviews />}
          />

          <Route
            path="resume"
            element={<MyResume />}
          />

          <Route
            path="skill-assessment"
            element={<SkillAssessment />}
          />

          <Route
            path="profile"
            element={<JobSeekerProfile />}
          />

          <Route
            path="notifications"
            element={<Notifications />}
          />

          {/* JOB SEEKER SUPPORT */}
          <Route
            path="support"
            element={<JobSeekerSupport />}
          />

        </Route>


        {/* =====================================================
            OTHER
        ===================================================== */}
        /* =====================================================
    JOB HOLDER
===================================================== */

<Route
  path="/jobholder"
  element={<JobHolderLayout />}
>
  {/* JOB HOLDER DASHBOARD */}

  <Route
    index
    element={<JobHolder />}
  />
  <Route
    path="dashboard"
    element={<JobHolderDashboard />}
  />
   <Route
    path="create-job"
    element={<JobHolderCreateJob />}
  /><Route
    path="jobs"
    element={<JobHolderJobs />}
  />
   <Route
    path="applicants"
    element={<JobHolderApplicants />}
  />

   <Route
    path="interviews"
    element={<JobHolderInterviews />}
  />
   <Route
    path="approved-jobs"
    element={<JobHolderApprovedJobs />}
  />
  <Route
  path="profile"
  element={<JobHolderProfile />}
/>
</Route>

        {/* =====================================================
            404
        ===================================================== */}

        <Route
          path="*"
          element={
            <div
              style={{
                padding: "50px",
                textAlign: "center",
              }}
            >
              <h1>404</h1>
              <p>Page not found</p>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;