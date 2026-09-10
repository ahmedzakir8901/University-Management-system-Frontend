import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip
} from '@mui/material';
import { Add, Delete, Logout } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { hostelService } from '../../../services/hostelService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const schema = yup.object().shape({
  studentId: yup.number().required('Student required'),
  hostelRoomId: yup.number().required('Room required'),
});

function AllocationsTab() {
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: allocations, isLoading, error } = useQuery({
    queryKey: ['allocations'],
    queryFn: hostelService.getAllocations,
  });

  const { data: students = [] } = useQuery({ queryKey: ['students-lookup'], queryFn: hostelService.getStudents });
  const { data: rooms = [] } = useQuery({ queryKey: ['hostelRooms'], queryFn: hostelService.getHostelRooms });
  const { data: hostels = [] } = useQuery({ queryKey: ['hostels'], queryFn: hostelService.getHostels });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { studentId: '', hostelRoomId: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: hostelService.deleteAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      toast.success('Allocation deleted');
    },
  });

  const vacateMutation = useMutation({
    mutationFn: hostelService.vacateAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      toast.success('Student vacated the room');
    },
  });

  const createMutation = useMutation({
    mutationFn: hostelService.createAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allocations'] });
      toast.success('Allocation created!');
      handleClose();
    },
  });

  const handleAdd = () => {
    reset({ studentId: '', hostelRoomId: '' });
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

  const getRoomLabel = (id) => {
    const r = rooms.find(r => r.id === id);
    if (!r) return 'Unknown';
    const h = hostels.find(h => h.id === r.hostelId);
    return `${h?.name || 'N/A'} - Room ${r.roomNumber}`;
  };

  // Filter by status (Active / Vacated)
  const filtered = (allocations || []).filter(a => {
    if (filterStatus === 'ACTIVE') return !a.vacatedDate;
    if (filterStatus === 'VACATED') return !!a.vacatedDate;
    return true;
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading allocations.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
            <MenuItem value="ACTIVE">Active Only</MenuItem>
            <MenuItem value="VACATED">Vacated Only</MenuItem>
            <MenuItem value="ALL">All</MenuItem>
          </Select>
        </FormControl>
        <RoleGate allowedRoles={['ADMIN']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Allocate Room</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Allocated Date</TableCell>
              <TableCell>Vacated Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((allocation) => (
              <TableRow key={allocation.id} hover>
                <TableCell>{getStudentLabel(allocation.studentId)}</TableCell>
                <TableCell><strong>{getRoomLabel(allocation.hostelRoomId)}</strong></TableCell>
                <TableCell>{allocation.allocatedDate}</TableCell>
                <TableCell>{allocation.vacatedDate || '-'}</TableCell>
                <TableCell>
                  {allocation.vacatedDate
                    ? <Chip label="VACATED" color="default" size="small" />
                    : <Chip label="ACTIVE" color="success" size="small" />}
                </TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN']}>
                    {!allocation.vacatedDate && (
                      <IconButton size="small" color="warning" title="Vacate Room"
                        onClick={() => {
                          if (window.confirm('Mark this student as vacated?'))
                            vacateMutation.mutate(allocation.id);
                        }}>
                        <Logout />
                      </IconButton>
                    )}
                    <IconButton size="small" color="error" onClick={() => {
                      if (window.confirm('Permanently delete this allocation?'))
                        deleteMutation.mutate(allocation.id);
                    }}><Delete /></IconButton>
                  </RoleGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth
        disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <DialogTitle>Allocate Room to Student</DialogTitle>
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
                <Controller name="hostelRoomId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.hostelRoomId}>
                    <InputLabel>Room</InputLabel>
                    <Select {...field} label="Room">
                      {rooms.map(r => (
                        <MenuItem key={r.id} value={r.id}>{getRoomLabel(r.id)} — Rs. {r.monthlyRent}/month</MenuItem>
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
            {createMutation.isPending ? <CircularProgress size={24} /> : 'Allocate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AllocationsTab;