import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem
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
  campusId: yup.number().required('Please select a campus'),
});

function DepartmentsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const queryClient = useQueryClient();

  const { data: departments, isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: settingsService.getDepartments,
  });

  const { data: campuses = [] } = useQuery({
    queryKey: ['campuses'],
    queryFn: settingsService.getCampuses,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', code: '', campusId: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: settingsService.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: settingsService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => settingsService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingDept(null);
    reset({ name: '', code: '', campusId: '' });
    setOpenModal(true);
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    reset(dept);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingDept(null);
  };

  const onSubmit = (data) => {
    if (editingDept) updateMutation.mutate({ id: editingDept.id, data });
    else createMutation.mutate(data);
  };

  const filtered = (departments || []).filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCampusName = (campusId) => {
    const campus = campuses.find(c => c.id === campusId);
    return campus ? campus.name : 'Unknown';
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading departments.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          size="small" placeholder="Search departments..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
        />
        <RoleGate allowedRoles={['ADMIN']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Department</Button>
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
            {filtered.map((dept) => (
              <TableRow key={dept.id} hover>
                <TableCell><strong>{dept.code}</strong></TableCell>
                <TableCell>{dept.name}</TableCell>
                <TableCell>{getCampusName(dept.campusId)}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(dept)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                      if (window.confirm('Delete this department?')) deleteMutation.mutate(dept.id);
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
        <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <TextField {...field} label="Department Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
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

export default DepartmentsTab;