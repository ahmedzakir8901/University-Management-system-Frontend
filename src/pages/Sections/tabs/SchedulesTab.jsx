import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { sectionService } from '../../../services/sectionService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const schema = yup.object().shape({
  sectionId: yup.number().required('Please select a section'),
  roomId: yup.number().required('Please select a room'),
  dayOfWeek: yup.string().required('Day is required'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string().required('End time is required'),
});

function SchedulesTab() {
  const [openModal, setOpenModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const queryClient = useQueryClient();

  const { data: schedules, isLoading, error } = useQuery({
    queryKey: ['schedules'],
    queryFn: sectionService.getSchedules,
  });

  const { data: sections = [] } = useQuery({ queryKey: ['sections'], queryFn: sectionService.getSections });
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms-lookup'], queryFn: sectionService.getRooms });
  const { data: courses = [] } = useQuery({ queryKey: ['courses-lookup'], queryFn: sectionService.getCourses });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { sectionId: '', roomId: '', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:30' }
  });

  const deleteMutation = useMutation({
    mutationFn: sectionService.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: sectionService.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sectionService.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Schedule updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingSchedule(null);
    reset({ sectionId: '', roomId: '', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:30' });
    setOpenModal(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    reset(schedule);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingSchedule(null);
  };

  const onSubmit = (data) => {
    if (editingSchedule) updateMutation.mutate({ id: editingSchedule.id, data });
    else createMutation.mutate(data);
  };

  const getSectionLabel = (sectionId) => {
    const s = sections.find(s => s.id === sectionId);
    if (!s) return 'Unknown';
    const course = courses.find(c => c.id === s.courseId);
    return `${course?.code || 'N/A'} - Section ${s.sectionName}`;
  };

  const getRoomLabel = (roomId) => rooms.find(r => r.id === roomId)?.roomNumber || 'Unknown';

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading schedules.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Schedule</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Section</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules?.map((schedule) => (
              <TableRow key={schedule.id} hover>
                <TableCell><strong>{getSectionLabel(schedule.sectionId)}</strong></TableCell>
                <TableCell>
                  <Chip label={schedule.dayOfWeek} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>{schedule.startTime} - {schedule.endTime}</TableCell>
                <TableCell>Room {getRoomLabel(schedule.roomId)}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(schedule)}><Edit /></IconButton>
                    <RoleGate allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="error" onClick={() => {
                        if (window.confirm('Delete this schedule?')) deleteMutation.mutate(schedule.id);
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
        <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="dayOfWeek" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.dayOfWeek}>
                    <InputLabel>Day</InputLabel>
                    <Select {...field} label="Day">
                      {DAYS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="roomId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.roomId}>
                    <InputLabel>Room</InputLabel>
                    <Select {...field} label="Room">
                      {rooms.map(r => <MenuItem key={r.id} value={r.id}>Room {r.roomNumber}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="startTime" control={control} render={({ field }) => (
                  <TextField {...field} label="Start Time" type="time" fullWidth error={!!errors.startTime}
                    helperText={errors.startTime?.message} slotProps={{ inputLabel: { shrink: true } }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="endTime" control={control} render={({ field }) => (
                  <TextField {...field} label="End Time" type="time" fullWidth error={!!errors.endTime}
                    helperText={errors.endTime?.message} slotProps={{ inputLabel: { shrink: true } }} />
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

export default SchedulesTab;