import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip
} from '@mui/material';
import { Add, Delete, ArrowUpward } from '@mui/icons-material';
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
  position: yup.number().min(1).required('Position is required'),
});

function WaitlistsTab() {
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: waitlists, isLoading, error } = useQuery({
    queryKey: ['waitlists'],
    queryFn: enrollmentService.getWaitlists,
  });

  const { data: students = [] } = useQuery({ queryKey: ['students-lookup'], queryFn: enrollmentService.getStudents });
  const { data: sections = [] } = useQuery({ queryKey: ['sections-lookup'], queryFn: enrollmentService.getSections });
  const { data: courses = [] } = useQuery({ queryKey: ['courses-lookup'], queryFn: enrollmentService.getCourses });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { studentId: '', sectionId: '', position: 1 }
  });

  const removeMutation = useMutation({
    mutationFn: enrollmentService.removeFromWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlists'] });
      toast.success('Removed from waitlist');
    },
  });

  const createMutation = useMutation({
    mutationFn: enrollmentService.createWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waitlists'] });
      toast.success('Added to waitlist!');
      handleClose();
    },
  });

  const handleAdd = () => {
    reset({ studentId: '', sectionId: '', position: 1 });
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

  // Sort by position so the queue is clear
  const sortedWaitlists = (waitlists || []).sort((a, b) => a.position - b.position);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading waitlists.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add to Waitlist</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Position</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedWaitlists.map((entry) => (
              <TableRow key={entry.id} hover>
                <TableCell>
                  <Chip label={`#${entry.position}`} color={entry.position === 1 ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell>{getStudentLabel(entry.studentId)}</TableCell>
                <TableCell><strong>{getSectionLabel(entry.sectionId)}</strong></TableCell>
                <TableCell>{new Date(entry.requestedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                    {entry.position === 1 && (
                      <IconButton size="small" color="success" title="Enroll (move from waitlist)">
                        <ArrowUpward />
                      </IconButton>
                    )}
                    <RoleGate allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="error" onClick={() => {
                        if (window.confirm('Remove from waitlist?')) removeMutation.mutate(entry.id);
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
        <DialogTitle>Add Student to Waitlist</DialogTitle>
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
              <Grid size={{ xs: 12, sm: 8 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="position" control={control} render={({ field }) => (
                  <TextField {...field} label="Position" type="number" fullWidth error={!!errors.position} helperText={errors.position?.message} />
                )} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={createMutation.isPending}>
            {createMutation.isPending ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WaitlistsTab;