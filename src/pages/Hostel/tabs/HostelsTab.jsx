import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { hostelService } from '../../../services/hostelService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const HOSTEL_TYPES = ['MALE', 'FEMALE', 'COED'];

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  campusId: yup.number().required('Campus is required'),
  type: yup.string().required('Type is required'),
  wardenName: yup.string().required('Warden name is required'),
  contactNumber: yup.string().required('Contact number is required'),
});

function HostelsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const queryClient = useQueryClient();

  const { data: hostels, isLoading, error } = useQuery({
    queryKey: ['hostels'],
    queryFn: hostelService.getHostels,
  });

  const { data: campuses = [] } = useQuery({ queryKey: ['campuses-lookup'], queryFn: hostelService.getCampuses });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', campusId: '', type: 'MALE', wardenName: '', contactNumber: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: hostelService.deleteHostel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      toast.success('Hostel deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: hostelService.createHostel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      toast.success('Hostel added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => hostelService.updateHostel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostels'] });
      toast.success('Hostel updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingHostel(null);
    reset({ name: '', campusId: '', type: 'MALE', wardenName: '', contactNumber: '' });
    setOpenModal(true);
  };

  const handleEdit = (hostel) => {
    setEditingHostel(hostel);
    reset(hostel);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingHostel(null);
  };

  const onSubmit = (data) => {
    if (editingHostel) updateMutation.mutate({ id: editingHostel.id, data });
    else createMutation.mutate(data);
  };

  const getCampusName = (id) => campuses.find(c => c.id === id)?.name || 'Unknown';

  const getTypeColor = (type) => {
    switch (type) {
      case 'MALE': return 'primary';
      case 'FEMALE': return 'secondary';
      case 'COED': return 'warning';
      default: return 'default';
    }
  };

  const filtered = (hostels || []).filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.wardenName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading hostels.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          size="small" placeholder="Search hostels or wardens..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
        />
        <RoleGate allowedRoles={['ADMIN']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Hostel</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Campus</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Warden</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((hostel) => (
              <TableRow key={hostel.id} hover>
                <TableCell><strong>{hostel.name}</strong></TableCell>
                <TableCell>{getCampusName(hostel.campusId)}</TableCell>
                <TableCell>
                  <Chip label={hostel.type} color={getTypeColor(hostel.type)} size="small" />
                </TableCell>
                <TableCell>{hostel.wardenName}</TableCell>
                <TableCell>{hostel.contactNumber}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(hostel)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                      if (window.confirm('Delete this hostel?')) deleteMutation.mutate(hostel.id);
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
        <DialogTitle>{editingHostel ? 'Edit Hostel' : 'Add Hostel'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <TextField {...field} label="Hostel Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="type" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type">
                      {HOSTEL_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="campusId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.campusId}>
                    <InputLabel>Campus</InputLabel>
                    <Select {...field} label="Campus">
                      {campuses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="wardenName" control={control} render={({ field }) => (
                  <TextField {...field} label="Warden Name" fullWidth error={!!errors.wardenName} helperText={errors.wardenName?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="contactNumber" control={control} render={({ field }) => (
                  <TextField {...field} label="Contact Number" fullWidth error={!!errors.contactNumber} helperText={errors.contactNumber?.message} />
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

export default HostelsTab;