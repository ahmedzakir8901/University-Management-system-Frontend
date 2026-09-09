import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, InputAdornment, Chip
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../../services/facultyService';
import FacultyFormModal from '../../components/faculty/FacultyFormModal';
import RoleGate from '../../components/RoleGate'; // <-- NEW IMPORT

function FacultyList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const { data: faculty, isLoading, error } = useQuery({
    queryKey: ['faculty'],
    queryFn: facultyService.getAllFaculty,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: facultyService.deleteFaculty,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faculty'] }),
  });

  const filteredFaculty = (faculty || []).filter((f) =>
    f.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading faculty: {error.message}</Alert>;

  const handleAdd = () => { setEditingFaculty(null); setOpenModal(true); };
  const handleEdit = (facultyMember) => { setEditingFaculty(facultyMember); setOpenModal(true); };
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) deleteMutation.mutate(id);
  };

  return (
    <Box>
      {/* Header and Add Button - Only ADMIN and FACULTY can add */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Faculty</Typography>
        <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Faculty</Button>
        </RoleGate>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Search by name or employee ID..."
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
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFaculty.map((f) => (
              <TableRow key={f.id} hover>
                <TableCell>{f.employeeId}</TableCell>
                <TableCell>{f.firstName} {f.lastName}</TableCell>
                <TableCell>{f.email}</TableCell>
                <TableCell>
                  <Chip label={f.designation} color="primary" variant="outlined" size="small" />
                </TableCell>
                <TableCell>{f.departmentId}</TableCell>
                <TableCell>{f.specialization}</TableCell>
                <TableCell>
                  {/* Only ADMIN and FACULTY can edit */}
                  <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                    <IconButton color="secondary" onClick={() => handleEdit(f)}><Edit /></IconButton>
                  </RoleGate>

                  {/* Only ADMIN can delete */}
                  <RoleGate allowedRoles={['ADMIN']}>
                    <IconButton color="error" onClick={() => handleDelete(f.id)}><Delete /></IconButton>
                  </RoleGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <FacultyFormModal open={openModal} onClose={() => setOpenModal(false)} faculty={editingFaculty} />
    </Box>
  );
}

export default FacultyList;