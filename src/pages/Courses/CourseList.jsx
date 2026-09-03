// src/pages/Courses/CourseList.jsx
import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, Chip, TextField, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import CourseFormModal from '../../components/courses/CourseFormModal';
import RoleGate from '../../components/RoleGate'; // <-- IMPORT RoleGate

function CourseList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAllCourses,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });

  const filteredCourses = (courses || []).filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading courses: {error.message}</Alert>;

  const handleAdd = () => { setEditingCourse(null); setOpenModal(true); };
  const handleEdit = (course) => { setEditingCourse(course); setOpenModal(true); };
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) deleteMutation.mutate(id);
  };

  return (
    <Box>
      {/* Header and Add Button - Only ADMIN and FACULTY can add */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Courses</Typography>
        <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Course</Button>
        </RoleGate>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Search by course code or title..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id} hover>
                <TableCell><strong>{course.code}</strong></TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.departmentId}</TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>
                  <Chip label={course.isElective ? 'Elective' : 'Core'} color={course.isElective ? 'warning' : 'primary'} size="small" />
                </TableCell>
                <TableCell>
                  {/* Only ADMIN and FACULTY can edit */}
                  <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                    <IconButton color="secondary" onClick={() => handleEdit(course)}><Edit /></IconButton>
                  </RoleGate>

                  {/* Only ADMIN can delete */}
                  <RoleGate allowedRoles={['ADMIN']}>
                    <IconButton color="error" onClick={() => handleDelete(course.id)}><Delete /></IconButton>
                  </RoleGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CourseFormModal open={openModal} onClose={() => setOpenModal(false)} course={editingCourse} />
    </Box>
  );
}

export default CourseList;