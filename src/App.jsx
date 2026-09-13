import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
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
import ProfilePage from './pages/Profile/ProfilePage'; // <-- ADD // <--- NEW IMPORT ADDED
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
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
          <Route path="grades" element={<GradesPage />} /> {/* <--- NEW ROUTE ADDED */}
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="infrastructure" element={<InfrastructurePage />} />
          <Route path="exams" element={<ExamsPage />} /> {/* <--- NEW ROUTE ADDED */}
          <Route path="hostel" element={<HostelPage />} /> {/* <--- NEW ROUTE ADDED */}
          <Route path="evaluations" element={<EvaluationsPage />} /> {/* <--- NEW ROUTE ADDED */}
          <Route path="audit-logs" element={<AuditLogsPage />} /> {/* <--- NEW ROUTE ADDED */}
          <Route path="profile" element={<ProfilePage />} /> {/* <-- ADD */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;