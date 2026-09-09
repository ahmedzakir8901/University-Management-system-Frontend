import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import StudentList from './pages/Students/StudentList';
import CourseList from './pages/Courses/CourseList';
import FacultyList from './pages/Faculty/FacultyList';
import AttendancePage from './pages/Attendance/AttendancePage';
import FinancePage from './pages/Finance/FinancePage';
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
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="finance" element={<FinancePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;