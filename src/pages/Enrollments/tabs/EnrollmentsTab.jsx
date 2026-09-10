import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip
} from '@mui/material';
import { Add, Delete, Search, Cancel } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { enrollmentService } from '../../../services/enrollmentService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const schema = yup.object().shape({
  studentId: yup.number().required('Please select a student'),
  sectionId: yup.number().required('Please select a section'),
});

function EnrollmentsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const queryClient = useQueryClient();

  const { data: enrollments, isLoading, error } = useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentService.getEnrollments,
  });

  const { data: students = [] } = useQuery({ queryKey: ['students-lookup'], queryFn: enrollmentService.getStudents });
  const { data: sections = [] } = useQuery({ queryKey: ['sections-lookup'], queryFn: enrollmentService.getSections });
  const { data: courses = [] } = useQuery({ queryKey: ['courses-lookup'], queryFn: enrollmentService.getCourses });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { studentId: '', sectionId: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: enrollmentService.deleteEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Enrollment deleted');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => enrollmentService.updateEnrollmentStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success(`Enrollment marked as ${variables.status}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: enrollmentService.createEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Student enrolled!');
      handleClose();
    },
  });

  const handleAdd = () => {
    reset({ studentId: '', sectionId: '' });
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const getStudentLabel = (id) => {
    const s = students.find(s => s.id === id);
    return s ? `${s.rollNumber} - ${s.firstName} ${s.lastName}` : 'Unknown';
  };

  const getSectionLabel = (id) => {
    const s = sections.find(s => s.id === id);
    if (!s) return 'Unknown';
    const c = courses.find(c => c.id === s.courseId);
    return `${c?.code || 'N/A'} - Section ${s.sectionName}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ENROLLED': return 'success';
      case 'DROPPED': return 'error';
      case 'WITHDRAWN': return 'warning';
      default: return 'default';
    }
  };

  const filtered = (enrollments || []).filter(e => {
    const matchesSearch =
      getStudentLabel(e.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSectionLabel(e.sectionId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || e.enrollmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading enrollments.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 300 }}>
          <TextField
            size="small" placeholder="Search student or section..." fullWidth
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="ENROLLED">Enrolled</MenuItem>
              <MenuItem value="DROPPED">Dropped</MenuItem>
              <MenuItem value="WITHDRAWN">Withdrawn</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Enroll Student</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Enrolled At</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((enrollment) => (
              <TableRow key={enrollment.id} hover>
                <TableCell>{getStudentLabel(enrollment.studentId)}</TableCell>
                <TableCell><strong>{getSectionLabel(enrollment.sectionId)}</strong></TableCell>
                <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip label={enrollment.enrollmentStatus} color={getStatusColor(enrollment.enrollmentStatus)} size="small" />
                </TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                    {enrollment.enrollmentStatus === 'ENROLLED' && (
                      <IconButton size="small" color="warning" title="Mark as Dropped"
                        onClick={() => statusMutation.mutate({ id: enrollment.id, status: 'DROPPED' })}>
                        <Cancel />
                      </IconButton>
                    )}
                    <RoleGate allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="error" onClick={() => {
                        if (window.confirm('Delete this enrollment?')) deleteMutation.mutate(enrollment.id);
                      }}><Delete /></IconButton>
                    </RoleGate>
                  </RoleGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth
        disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <DialogTitle>Enroll Student</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller name="studentId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.studentId}>
                    <InputLabel>Student</InputLabel>
                    <Select {...field} label="Student">
                      {students.map(s => (
                        <MenuItem key={s.id} value={s.id}>{s.rollNumber} - {s.firstName} {s.lastName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="sectionId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.sectionId}>
                    <InputLabel>Section</InputLabel>
                    <Select {...field} label="Section">
                      {sections.map(s => (
                        <MenuItem key={s.id} value={s.id}>{getSectionLabel(s.id)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? <CircularProgress size={24} /> : 'Enroll'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EnrollmentsTab;