import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { infrastructureService } from '../../../services/infrastructureService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const schema = yup.object().shape({
  roomNumber: yup.string().required('Room number is required'),
  capacity: yup.number().min(1).required('Capacity must be at least 1'),
  roomType: yup.string().required('Room type is required'),
  buildingId: yup.number().required('Please select a building'),
});

const ROOM_TYPES = ['LECTURE_HALL', 'LAB', 'SEMINAR_ROOM', 'AUDITORIUM'];

function RoomsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const queryClient = useQueryClient();

  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: infrastructureService.getRooms,
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: infrastructureService.getBuildings,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { roomNumber: '', capacity: 30, roomType: 'LECTURE_HALL', buildingId: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: infrastructureService.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: infrastructureService.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => infrastructureService.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingRoom(null);
    reset({ roomNumber: '', capacity: 30, roomType: 'LECTURE_HALL', buildingId: '' });
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

  const filtered = (rooms || []).filter(r =>
    r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBuildingName = (buildingId) => {
    const b = buildings.find(b => b.id === buildingId);
    return b ? `${b.name} (${b.code})` : 'Unknown';
  };

  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'LECTURE_HALL': return 'primary';
      case 'LAB': return 'secondary';
      case 'SEMINAR_ROOM': return 'info';
      case 'AUDITORIUM': return 'warning';
      default: return 'default';
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading rooms.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          size="small" placeholder="Search by room number..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
        />
        <RoleGate allowedRoles={['ADMIN']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Room</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room #</TableCell>
              <TableCell>Building</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((room) => (
              <TableRow key={room.id} hover>
                <TableCell><strong>{room.roomNumber}</strong></TableCell>
                <TableCell>{getBuildingName(room.buildingId)}</TableCell>
                <TableCell>
                  <Chip label={room.roomType.replace('_', ' ')} color={getRoomTypeColor(room.roomType)} size="small" />
                </TableCell>
                <TableCell>{room.capacity} seats</TableCell>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="roomNumber" control={control} render={({ field }) => (
                  <TextField {...field} label="Room Number" fullWidth error={!!errors.roomNumber} helperText={errors.roomNumber?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="capacity" control={control} render={({ field }) => (
                  <TextField {...field} label="Capacity" type="number" fullWidth error={!!errors.capacity} helperText={errors.capacity?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="buildingId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.buildingId}>
                    <InputLabel>Building</InputLabel>
                    <Select {...field} label="Building">
                      {buildings.map(b => (
                        <MenuItem key={b.id} value={b.id}>{b.name} ({b.code})</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="roomType" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.roomType}>
                    <InputLabel>Room Type</InputLabel>
                    <Select {...field} label="Room Type">
                      {ROOM_TYPES.map(t => (
                        <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>
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

export default RoomsTab;