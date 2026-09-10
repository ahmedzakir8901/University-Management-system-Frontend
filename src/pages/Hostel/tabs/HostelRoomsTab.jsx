import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  TextField
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { hostelService } from '../../../services/hostelService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const schema = yup.object().shape({
  hostelId: yup.number().required('Hostel is required'),
  roomNumber: yup.string().required('Room number is required'),
  capacity: yup.number().min(1).required('Capacity required'),
  monthlyRent: yup.number().min(0).required('Monthly rent required'),
});

function HostelRoomsTab() {
  const [filterHostelId, setFilterHostelId] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const queryClient = useQueryClient();

  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['hostelRooms'],
    queryFn: hostelService.getHostelRooms,
  });

  const { data: hostels = [] } = useQuery({ queryKey: ['hostels'], queryFn: hostelService.getHostels });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { hostelId: '', roomNumber: '', capacity: 2, monthlyRent: 15000 }
  });

  const deleteMutation = useMutation({
    mutationFn: hostelService.deleteHostelRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelRooms'] });
      toast.success('Room deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: hostelService.createHostelRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelRooms'] });
      toast.success('Room added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => hostelService.updateHostelRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelRooms'] });
      toast.success('Room updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingRoom(null);
    reset({ hostelId: '', roomNumber: '', capacity: 2, monthlyRent: 15000 });
    setOpenModal(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    reset(room);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingRoom(null);
  };

  const onSubmit = (data) => {
    if (editingRoom) updateMutation.mutate({ id: editingRoom.id, data });
    else createMutation.mutate(data);
  };

  const getHostelName = (id) => hostels.find(h => h.id === id)?.name || 'Unknown';

  const filtered = (rooms || []).filter(r =>
    !filterHostelId || r.hostelId === Number(filterHostelId)
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading hostel rooms.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Filter by Hostel</InputLabel>
          <Select value={filterHostelId} onChange={(e) => setFilterHostelId(e.target.value)} label="Filter by Hostel">
            <MenuItem value="">All Hostels</MenuItem>
            {hostels.map(h => (
              <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <RoleGate allowedRoles={['ADMIN']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Room</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hostel</TableCell>
              <TableCell>Room Number</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Monthly Rent</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((room) => (
              <TableRow key={room.id} hover>
                <TableCell>{getHostelName(room.hostelId)}</TableCell>
                <TableCell><strong>{room.roomNumber}</strong></TableCell>
                <TableCell>{room.capacity} beds</TableCell>
                <TableCell>Rs. {room.monthlyRent.toLocaleString()}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(room)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                      if (window.confirm('Delete this room?')) deleteMutation.mutate(room.id);
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
        <DialogTitle>{editingRoom ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller name="hostelId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.hostelId}>
                    <InputLabel>Hostel</InputLabel>
                    <Select {...field} label="Hostel">
                      {hostels.map(h => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="roomNumber" control={control} render={({ field }) => (
                  <TextField {...field} label="Room Number" fullWidth error={!!errors.roomNumber} helperText={errors.roomNumber?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="capacity" control={control} render={({ field }) => (
                  <TextField {...field} label="Capacity" type="number" fullWidth error={!!errors.capacity} helperText={errors.capacity?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="monthlyRent" control={control} render={({ field }) => (
                  <TextField {...field} label="Monthly Rent (Rs.)" type="number" fullWidth error={!!errors.monthlyRent} helperText={errors.monthlyRent?.message} />
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

export default HostelRoomsTab;