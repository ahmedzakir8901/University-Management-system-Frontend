import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword'; // <-- NEW: moved up with other public routes
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import StudentList from './pages/Students/StudentList';
import CourseList from './pages/Courses/CourseList';
import FacultyList from './pages/Faculty/FacultyList';
import AttendancePage from './pages/Attendance/AttendancePage';
import FinancePage from './pages/Finance/FinancePage';
import LibraryPage from './pages/Library/LibraryPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import InfrastructurePage from './pages/Infrastructure/InfrastructurePage';
import SectionsPage from './pages/Sections/SectionsPage';
import EnrollmentsPage from './pages/Enrollments/EnrollmentsPage';
import GradesPage from './pages/Grades/GradesPage';
import ExamsPage from './pages/Exams/ExamsPage';
import HostelPage from './pages/Hostel/HostelPage';
import EvaluationsPage from './pages/Evaluations/EvaluationsPage';
import AuditLogsPage from './pages/AuditLogs/AuditLogsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* <-- MOVED HERE (was inside protected) */}

        {/* ===== PROTECTED ROUTES ===== */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="courses" element={<CourseList />} />
          <Route path="faculty" element={<FacultyList />} />
          <Route path="sections" element={<SectionsPage />} />
          <Route path="enrollments" element={<EnrollmentsPage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="infrastructure" element={<InfrastructurePage />} />
          <Route path="exams" element={<ExamsPage />} />
          <Route path="hostel" element={<HostelPage />} />
          <Route path="evaluations" element={<EvaluationsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;