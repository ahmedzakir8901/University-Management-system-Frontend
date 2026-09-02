import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Grid, Chip, Divider, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';

function StudentDetailsModal({ open, onClose, studentId }) {
  const { data: student, isLoading, error } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getStudentById(studentId),
    enabled: open && !!studentId, // Only fetch when open!
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Student Details</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">Failed to load details</Alert>
        ) : !student ? (
          // CRITICAL FIX: If student is undefined (like when closed), return null or a placeholder
          <Typography color="textSecondary">No student data available.</Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {/* Everything else is safe because we know 'student' exists now */}
            <Typography variant="h6" gutterBottom>
              {student.firstName} {student.lastName}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Roll Number:</strong> {student.rollNumber}</Typography>
                <Typography><strong>Email:</strong> {student.email}</Typography>
                <Typography><strong>Semester:</strong> {student.currentSemester}</Typography>
                <Typography><strong>CGPA:</strong> {student.cgpa}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Chip label={student.academicStatus} color={student.academicStatus === 'ACTIVE' ? 'success' : 'warning'} />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>Emergency Contacts</Typography>
            {(student.emergencyContacts || []).length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Relationship</TableCell><TableCell>Phone</TableCell><TableCell>Address</TableCell></TableRow></TableHead>
                  <TableBody>
                    {student.emergencyContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>{contact.contactName}</TableCell>
                        <TableCell>{contact.relationship}</TableCell>
                        <TableCell>{contact.phoneNumber}</TableCell>
                        <TableCell>{contact.address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="textSecondary" sx={{ mb: 3 }}>No emergency contacts on file.</Typography>
            )}

            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>Enrolled Courses</Typography>
            {(student.enrolledCourses || []).length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Course Code</TableCell><TableCell>Title</TableCell><TableCell>Credits</TableCell></TableRow></TableHead>
                  <TableBody>
                    {student.enrolledCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="textSecondary" sx={{ mb: 3 }}>No courses enrolled.</Typography>
            )}

            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>Grades</Typography>
            {(student.grades || []).length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Course</TableCell><TableCell>Item Type</TableCell><TableCell>Marks</TableCell><TableCell>Max Marks</TableCell><TableCell>Weightage</TableCell></TableRow></TableHead>
                  <TableBody>
                    {student.grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>{grade.courseCode}</TableCell>
                        <TableCell>{grade.itemType}</TableCell>
                        <TableCell>{grade.marksObtained}</TableCell>
                        <TableCell>{grade.maxMarks}</TableCell>
                        <TableCell>{grade.weightage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="textSecondary">No grades recorded.</Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default StudentDetailsModal;