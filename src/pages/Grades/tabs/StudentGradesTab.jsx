import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip, TextField, LinearProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { gradeService } from '../../../services/gradeService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const schema = yup.object().shape({
  gradeItemId: yup.number().required('Please select a grade item'),
  studentId: yup.number().required('Please select a student'),
  marksObtained: yup.number().min(0).required('Marks required'),
});

function StudentGradesTab() {
  const [openModal, setOpenModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [filterItemId, setFilterItemId] = useState('');
  const queryClient = useQueryClient();

  const { data: studentGrades, isLoading, error } = useQuery({
    queryKey: ['studentGrades'],
    queryFn: gradeService.getStudentGrades,
  });

  const { data: gradeItems = [] } = useQuery({ queryKey: ['gradeItems'], queryFn: gradeService.getGradeItems });
  const { data: students = [] } = useQuery({ queryKey: ['students-lookup'], queryFn: gradeService.getStudents });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { gradeItemId: '', studentId: '', marksObtained: 0, feedback: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: gradeService.deleteStudentGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentGrades'] });
      toast.success('Grade deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: gradeService.createStudentGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentGrades'] });
      toast.success('Grade added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => gradeService.updateStudentGrade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentGrades'] });
      toast.success('Grade updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingGrade(null);
    reset({ gradeItemId: '', studentId: '', marksObtained: 0, feedback: '' });
    setOpenModal(true);
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    reset(grade);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingGrade(null);
  };

  const onSubmit = (data) => {
    if (editingGrade) updateMutation.mutate({ id: editingGrade.id, data });
    else createMutation.mutate(data);
  };

  const getStudentLabel = (id) => {
    const s = students.find(s => s.id === id);
    return s ? `${s.rollNumber} - ${s.firstName} ${s.lastName}` : 'Unknown';
  };

  const getGradeItemLabel = (id) => {
    const g = gradeItems.find(g => g.id === id);
    return g ? `${g.title} (${g.itemType.replace('_', ' ')})` : 'Unknown';
  };

  const getGradeItem = (id) => gradeItems.find(g => g.id === id);

  const filtered = (studentGrades || []).filter(g =>
    !filterItemId || g.gradeItemId === Number(filterItemId)
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading student grades.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Filter by Grade Item</InputLabel>
          <Select value={filterItemId} onChange={(e) => setFilterItemId(e.target.value)} label="Filter by Grade Item">
            <MenuItem value="">All Grade Items</MenuItem>
            {gradeItems.map(g => (
              <MenuItem key={g.id} value={g.id}>{g.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Grade</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Grade Item</TableCell>
              <TableCell>Marks</TableCell>
              <TableCell>Percentage</TableCell>
              <TableCell>Feedback</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((grade) => {
              const item = getGradeItem(grade.gradeItemId);
              const percent = item ? (grade.marksObtained / item.maxMarks) * 100 : 0;
              return (
                <TableRow key={grade.id} hover>
                  <TableCell>{getStudentLabel(grade.studentId)}</TableCell>
                  <TableCell>{getGradeItemLabel(grade.gradeItemId)}</TableCell>
                  <TableCell>
                    <strong>{grade.marksObtained}</strong> / {item?.maxMarks || '?'}
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(percent, 100)}
                        color={percent >= 80 ? 'success' : percent >= 50 ? 'primary' : 'error'}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <span>{percent.toFixed(1)}%</span>
                    </Box>
                  </TableCell>
                  <TableCell>{grade.feedback || '-'}</TableCell>
                  <TableCell>
                    <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                      <IconButton size="small" color="secondary" onClick={() => handleEdit(grade)}><Edit /></IconButton>
                      <RoleGate allowedRoles={['ADMIN']}>
                        <IconButton size="small" color="error" onClick={() => {
                          if (window.confirm('Delete this grade?')) deleteMutation.mutate(grade.id);
                        }}><Delete /></IconButton>
                      </RoleGate>
                    </RoleGate>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth
        disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <DialogTitle>{editingGrade ? 'Edit Grade' : 'Add Student Grade'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller name="gradeItemId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gradeItemId}>
                    <InputLabel>Grade Item</InputLabel>
                    <Select {...field} label="Grade Item">
                      {gradeItems.map(g => (
                        <MenuItem key={g.id} value={g.id}>{g.title} (Max: {g.maxMarks})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
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
                <Controller name="marksObtained" control={control} render={({ field }) => (
                  <TextField {...field} label="Marks Obtained" type="number" fullWidth
                    error={!!errors.marksObtained} helperText={errors.marksObtained?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="feedback" control={control} render={({ field }) => (
                  <TextField {...field} label="Feedback (optional)" fullWidth multiline rows={2} />
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

export default StudentGradesTab;