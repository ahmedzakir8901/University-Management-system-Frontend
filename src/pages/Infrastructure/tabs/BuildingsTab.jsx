import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem
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
  name: yup.string().required('Name is required'),
  code: yup.string().required('Code is required').max(10, 'Max 10 chars'),
  campusId: yup.number().required('Please select a campus'),
});

function BuildingsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const queryClient = useQueryClient();

  const { data: buildings, isLoading, error } = useQuery({
    queryKey: ['buildings'],
    queryFn: infrastructureService.getBuildings,
  });

  const { data: campuses = [] } = useQuery({
    queryKey: ['campuses'],
    queryFn: infrastructureService.getCampuses,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', code: '', campusId: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: infrastructureService.deleteBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success('Building deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: infrastructureService.createBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success('Building added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => infrastructureService.updateBuilding(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast.success('Building updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingBuilding(null);
    reset({ name: '', code: '', campusId: '' });
    setOpenModal(true);
  };

  const handleEdit = (building) => {
    setEditingBuilding(building);
    reset(building);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingBuilding(null);
  };

  const onSubmit = (data) => {
    if (editingBuilding) updateMutation.mutate({ id: editingBuilding.id, data });
    else createMutation.mutate(data);
  };

  const filtered = (buildings || []).filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCampusName = (campusId) => {
    const campus = campuses.find(c => c.id === campusId);
    return campus ? campus.name : 'Unknown';
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading buildings.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          size="small" placeholder="Search buildings..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
        />
        <RoleGate allowedRoles={['ADMIN']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Building</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Campus</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((building) => (
              <TableRow key={building.id} hover>
                <TableCell><strong>{building.code}</strong></TableCell>
                <TableCell>{building.name}</TableCell>
                <TableCell>{getCampusName(building.campusId)}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(building)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                      if (window.confirm('Delete this building?')) deleteMutation.mutate(building.id);
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
        <DialogTitle>{editingBuilding ? 'Edit Building' : 'Add Building'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <TextField {...field} label="Building Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="code" control={control} render={({ field }) => (
                  <TextField {...field} label="Code" fullWidth error={!!errors.code} helperText={errors.code?.message} />
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

export default BuildingsTab;