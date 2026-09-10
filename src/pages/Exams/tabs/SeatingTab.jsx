import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { examService } from '../../../services/examService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const schema = yup.object().shape({
  examId: yup.number().required('Exam required'),
  studentId: yup.number().required('Student required'),
  seatNumber: yup.string().required('Seat number required'),
  invigilatorFacultyId: yup.number().nullable(),
});

function SeatingTab() {
  const [openModal, setOpenModal] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [filterExamId, setFilterExamId] = useState('');
  const queryClient = useQueryClient();

  const { data: seating, isLoading, error } = useQuery({
    queryKey: ['examSeating'],
    queryFn: examService.getExamSeating,
  });

  const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: examService.getExams });
  const { data: students = [] } = useQuery({ queryKey: ['students-lookup'], queryFn: examService.getStudents });
  const { data: faculty = [] } = useQuery({ queryKey: ['faculty-lookup'], queryFn: examService.getFaculty });
  const { data: courses = [] } = useQuery({ queryKey: ['courses-lookup'], queryFn: examService.getCourses });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { examId: '', studentId: '', seatNumber: '', invigilatorFacultyId: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: examService.deleteExamSeat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSeating'] });
      toast.success('Seat deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: examService.createExamSeat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSeating'] });
      toast.success('Seat assigned!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => examService.updateExamSeat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examSeating'] });
      toast.success('Seat updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingSeat(null);
    reset({ examId: '', studentId: '', seatNumber: '', invigilatorFacultyId: '' });
    setOpenModal(true);
  };

  const handleEdit = (seat) => {
    setEditingSeat(seat);
    reset(seat);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingSeat(null);
  };

  const onSubmit = (data) => {
    if (editingSeat) updateMutation.mutate({ id: editingSeat.id, data });
    else createMutation.mutate(data);
  };

  const getStudentLabel = (id) => {
    const s = students.find(s => s.id === id);
    return s ? `${s.rollNumber} - ${s.firstName} ${s.lastName}` : 'Unknown';
  };

  const getFacultyLabel = (id) => {
    if (!id) return 'Unassigned';
    const f = faculty.find(f => f.id === id);
    return f ? `${f.firstName} ${f.lastName}` : 'Unknown';
  };

  const getExamLabel = (id) => {
    const e = exams.find(e => e.id === id);
    if (!e) return 'Unknown';
    const c = courses.find(c => c.id === e.courseId);
    return `${c?.code || 'N/A'} - ${e.examType} (${e.examDate})`;
  };

  const filtered = (seating || []).filter(s =>
    !filterExamId || s.examId === Number(filterExamId)
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading exam seating.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel>Filter by Exam</InputLabel>
          <Select value={filterExamId} onChange={(e) => setFilterExamId(e.target.value)} label="Filter by Exam">
            <MenuItem value="">All Exams</MenuItem>
            {exams.map(e => (
              <MenuItem key={e.id} value={e.id}>{getExamLabel(e.id)}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Assign Seat</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exam</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Seat #</TableCell>
              <TableCell>Invigilator</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((seat) => (
              <TableRow key={seat.id} hover>
                <TableCell>{getExamLabel(seat.examId)}</TableCell>
                <TableCell>{getStudentLabel(seat.studentId)}</TableCell>
                <TableCell>
                  <Chip label={seat.seatNumber} color="primary" size="small" />
                </TableCell>
                <TableCell>{getFacultyLabel(seat.invigilatorFacultyId)}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(seat)}><Edit /></IconButton>
                    <RoleGate allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="error" onClick={() => {
                        if (window.confirm('Delete this seat assignment?')) deleteMutation.mutate(seat.id);
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
        <DialogTitle>{editingSeat ? 'Edit Seat Assignment' : 'Assign Seat'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller name="examId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.examId}>
                    <InputLabel>Exam</InputLabel>
                    <Select {...field} label="Exam">
                      {exams.map(e => (
                        <MenuItem key={e.id} value={e.id}>{getExamLabel(e.id)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="seatNumber" control={control} render={({ field }) => (
                  <TextField {...field} label="Seat #" fullWidth error={!!errors.seatNumber} helperText={errors.seatNumber?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="invigilatorFacultyId" control={control} render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Invigilator (Optional)</InputLabel>
                    <Select {...field} label="Invigilator (Optional)">
                      <MenuItem value="">None</MenuItem>
                      {faculty.map(f => (
                        <MenuItem key={f.id} value={f.id}>{f.firstName} {f.lastName}</MenuItem>
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
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
            {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SeatingTab;