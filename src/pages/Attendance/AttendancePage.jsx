import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, CircularProgress, Alert, TextField, MenuItem, Select, InputLabel,
  FormControl, ToggleButton, ToggleButtonGroup, Grid
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendanceService';
import { toast } from 'react-hot-toast';

function AttendancePage() {
  // State for course, date, and the attendance record map
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'PRESENT' }

  // 1. Fetch Courses for the dropdown
  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-attendance'],
    queryFn: attendanceService.getCourses,
  });

  // 2. Fetch Students - ONLY when a course is selected (Dependent Fetching)
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students-by-course', selectedCourseId],
    queryFn: () => attendanceService.getStudentsByCourse(selectedCourseId),
    enabled: !!selectedCourseId, // <-- This is the magic! It only runs if selectedCourseId is not empty.
  });

  // 3. Save Attendance Mutation
  const saveMutation = useMutation({
    mutationFn: attendanceService.saveAttendance,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: () => toast.error('Failed to save attendance'),
  });

  // Handle changing the status of a student (Present/Absent)
  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(attendanceMap).length === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    const payload = {
      courseId: selectedCourseId,
      date: attendanceDate,
      records: Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId: Number(studentId),
        status,
      })),
    };

    saveMutation.mutate(payload);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Attendance Management</Typography>

      {/* Filters (Course & Date) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setAttendanceMap({}); // Reset attendance when course changes
              }}
              label="Select Course"
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Attendance Date"
            type="date"
            fullWidth
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Loading and Error states */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">Error loading students.</Alert>}

      {/* Student Attendance Table */}
      {selectedCourseId && !isLoading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Roll No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="center">Attendance Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => {
                const currentStatus = attendanceMap[student.id] || ''; // Default empty
                return (
                  <TableRow key={student.id} hover>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.firstName} {student.lastName}</TableCell>
                    <TableCell align="center">
                      <ToggleButtonGroup
                        value={currentStatus}
                        exclusive
                        onChange={(e, newStatus) => {
                          if (newStatus !== null) {
                            handleStatusChange(student.id, newStatus);
                          }
                        }}
                        size="small"
                      >
                        <ToggleButton value="PRESENT" sx={{ color: 'green', '&.Mui-selected': { bgcolor: 'green', color: 'white' } }}>
                          Present
                        </ToggleButton>
                        <ToggleButton value="ABSENT" sx={{ color: 'red', '&.Mui-selected': { bgcolor: 'red', color: 'white' } }}>
                          Absent
                        </ToggleButton>
                        <ToggleButton value="LATE" sx={{ color: 'orange', '&.Mui-selected': { bgcolor: 'orange', color: 'white' } }}>
                          Late
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Save Button */}
      {selectedCourseId && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default AttendancePage;