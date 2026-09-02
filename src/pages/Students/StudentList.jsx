import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, InputAdornment, Chip
} from '@mui/material';
import { Add, Edit, Delete, Search, Visibility } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import StudentFormModal from '../../components/students/StudentFormModal';
import StudentDetailsModal from '../../components/students/StudentDetailsModal';

function StudentList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFormModal, setOpenFormModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudentId, setViewingStudentId] = useState(null);

  const { data: students, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAllStudents,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: studentService.deleteStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  });

  // Safety: if students is undefined, use an empty array so .filter works
  const filteredStudents = (students || []).filter((student) =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading students: {error.message}</Alert>;

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) deleteMutation.mutate(id);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setOpenFormModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setOpenFormModal(true);
  };

  const handleView = (id) => {
    setViewingStudentId(id);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Students</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Student</Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Search by name or roll number..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>)
            }
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Roll No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>CGPA</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id} hover>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.firstName} {student.lastName}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.currentSemester}</TableCell>
                <TableCell>{student.cgpa}</TableCell>
                <TableCell>
                  <Chip label={student.academicStatus} color={student.academicStatus === 'ACTIVE' ? 'success' : 'warning'} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleView(student.id)}>
                    <Visibility />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleEdit(student)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(student.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <StudentFormModal open={openFormModal} onClose={() => setOpenFormModal(false)} student={editingStudent} />

      <StudentDetailsModal 
        open={!!viewingStudentId} 
        onClose={() => setViewingStudentId(null)} 
        studentId={viewingStudentId} 
      />
    </Box>
  );
}

export default StudentList;