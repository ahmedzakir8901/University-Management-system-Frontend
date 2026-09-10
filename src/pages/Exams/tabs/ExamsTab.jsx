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

const EXAM_TYPES = ['MIDTERM', 'FINAL', 'SUPPLEMENTARY'];

const schema = yup.object().shape({
  termId: yup.number().required('Term required'),
  courseId: yup.number().required('Course required'),
  examType: yup.string().required('Exam type required'),
  examDate: yup.string().required('Date required'),
  startTime: yup.string().required('Start time required'),
  endTime: yup.string().required('End time required'),
  roomId: yup.number().required('Room required'),
});

function ExamsTab() {
  const [openModal, setOpenModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const queryClient = useQueryClient();

  const { data: exams, isLoading, error } = useQuery({
    queryKey: ['exams'],
    queryFn: examService.getExams,
  });

  const { data: courses = [] } = useQuery({ queryKey: ['courses-lookup'], queryFn: examService.getCourses });
  const { data: terms = [] } = useQuery({ queryKey: ['terms-lookup'], queryFn: examService.getTerms });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms-lookup'], queryFn: examService.getRooms });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { termId: '', courseId: '', examType: 'MIDTERM', examDate: '', startTime: '09:00', endTime: '11:00', roomId: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: examService.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: examService.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam scheduled!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => examService.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Exam updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingExam(null);
    reset({ termId: '', courseId: '', examType: 'MIDTERM', examDate: '', startTime: '09:00', endTime: '11:00', roomId: '' });
    setOpenModal(true);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    reset(exam);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingExam(null);
  };

  const onSubmit = (data) => {
    if (editingExam) updateMutation.mutate({ id: editingExam.id, data });
    else createMutation.mutate(data);
  };

  const getCourseLabel = (id) => {
    const c = courses.find(c => c.id === id);
    return c ? `${c.code} - ${c.title}` : 'Unknown';
  };
  const getTermLabel = (id) => terms.find(t => t.id === id)?.name || 'Unknown';
  const getRoomLabel = (id) => rooms.find(r => r.id === id)?.roomNumber || 'Unknown';

  const getTypeColor = (type) => {
    switch (type) {
      case 'MIDTERM': return 'warning';
      case 'FINAL': return 'error';
      case 'SUPPLEMENTARY': return 'info';
      default: return 'default';
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading exams.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Schedule Exam</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Term</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams?.map((exam) => (
              <TableRow key={exam.id} hover>
                <TableCell><strong>{getCourseLabel(exam.courseId)}</strong></TableCell>
                <TableCell>{getTermLabel(exam.termId)}</TableCell>
                <TableCell><Chip label={exam.examType} color={getTypeColor(exam.examType)} size="small" /></TableCell>
                <TableCell>{exam.examDate}</TableCell>
                <TableCell>{exam.startTime} - {exam.endTime}</TableCell>
                <TableCell>Room {getRoomLabel(exam.roomId)}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(exam)}><Edit /></IconButton>
                    <RoleGate allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="error" onClick={() => {
                        if (window.confirm('Delete this exam?')) deleteMutation.mutate(exam.id);
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
        <DialogTitle>{editingExam ? 'Edit Exam' : 'Schedule Exam'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Controller name="courseId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.courseId}>
                    <InputLabel>Course</InputLabel>
                    <Select {...field} label="Course">
                      {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.code} - {c.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="termId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.termId}>
                    <InputLabel>Term</InputLabel>
                    <Select {...field} label="Term">
                      {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="examType" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.examType}>
                    <InputLabel>Exam Type</InputLabel>
                    <Select {...field} label="Exam Type">
                      {EXAM_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="examDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Exam Date" type="date" fullWidth
                    error={!!errors.examDate} helperText={errors.examDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="startTime" control={control} render={({ field }) => (
                  <TextField {...field} label="Start Time" type="time" fullWidth
                    error={!!errors.startTime} helperText={errors.startTime?.message}
                    slotProps={{ inputLabel: { shrink: true } }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="endTime" control={control} render={({ field }) => (
                  <TextField {...field} label="End Time" type="time" fullWidth
                    error={!!errors.endTime} helperText={errors.endTime?.message}
                    slotProps={{ inputLabel: { shrink: true } }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="roomId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.roomId}>
                    <InputLabel>Room</InputLabel>
                    <Select {...field} label="Room">
                      {rooms.map(r => <MenuItem key={r.id} value={r.id}>Room {r.roomNumber} (Capacity: {r.capacity})</MenuItem>)}
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

export default ExamsTab;