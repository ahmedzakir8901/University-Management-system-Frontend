import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { settingsService } from '../../../services/settingsService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  code: yup.string().required('Code is required').max(10, 'Max 10 chars'),
  address: yup.string().required('Address is required'),
  contactEmail: yup.string().email('Invalid email').required('Email is required'),
});

function CampusesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingCampus, setEditingCampus] = useState(null);
  const queryClient = useQueryClient();

  const { data: campuses, isLoading, error } = useQuery({
    queryKey: ['campuses'],
    queryFn: settingsService.getCampuses,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', code: '', address: '', contactEmail: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: settingsService.deleteCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      toast.success('Campus deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: settingsService.createCampus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      toast.success('Campus added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => settingsService.updateCampus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campuses'] });
      toast.success('Campus updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingCampus(null);
    reset({ name: '', code: '', address: '', contactEmail: '' });
    setOpenModal(true);
  };

  const handleEdit = (campus) => {
    setEditingCampus(campus);
    reset(campus);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingCampus(null);
  };

  const onSubmit = (data) => {
    if (editingCampus) updateMutation.mutate({ id: editingCampus.id, data });
    else createMutation.mutate(data);
  };

  const filtered = (campuses || []).filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading campuses.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          size="small" placeholder="Search campuses..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
        />
        <RoleGate allowedRoles={['ADMIN']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Campus</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Contact Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((campus) => (
              <TableRow key={campus.id} hover>
                <TableCell><strong>{campus.code}</strong></TableCell>
                <TableCell>{campus.name}</TableCell>
                <TableCell>{campus.address}</TableCell>
                <TableCell>{campus.contactEmail}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(campus)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                      if (window.confirm('Delete this campus?')) deleteMutation.mutate(campus.id);
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
        <DialogTitle>{editingCampus ? 'Edit Campus' : 'Add Campus'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <TextField {...field} label="Campus Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="code" control={control} render={({ field }) => (
                  <TextField {...field} label="Code" fullWidth error={!!errors.code} helperText={errors.code?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="address" control={control} render={({ field }) => (
                  <TextField {...field} label="Address" fullWidth multiline rows={2} error={!!errors.address} helperText={errors.address?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="contactEmail" control={control} render={({ field }) => (
                  <TextField {...field} label="Contact Email" type="email" fullWidth error={!!errors.contactEmail} helperText={errors.contactEmail?.message} />
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

export default CampusesTab;