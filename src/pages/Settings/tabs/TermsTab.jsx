import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, Chip, FormControlLabel, Checkbox
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { settingsService } from '../../../services/settingsService';
import { formatDate } from '../../../utils/formatDate';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  termCode: yup.string().required('Term code is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
});

function TermsTab() {
  const [openModal, setOpenModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const queryClient = useQueryClient();

  const { data: terms, isLoading, error } = useQuery({
    queryKey: ['terms'],
    queryFn: settingsService.getTerms,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', termCode: '', startDate: '', endDate: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: settingsService.deleteTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      toast.success('Term deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => settingsService.createTerm({ ...data, isCurrent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      toast.success('Term added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => settingsService.updateTerm(id, { ...data, isCurrent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      toast.success('Term updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingTerm(null);
    reset({ name: '', termCode: '', startDate: '', endDate: '' });
    setIsCurrent(false);
    setOpenModal(true);
  };

  const handleEdit = (term) => {
    setEditingTerm(term);
    reset(term);
    setIsCurrent(term.isCurrent);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingTerm(null);
  };

  const onSubmit = (data) => {
    if (editingTerm) updateMutation.mutate({ id: editingTerm.id, data });
    else createMutation.mutate(data);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading terms.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <RoleGate allowedRoles={['ADMIN']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Term</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {terms?.map((term) => (
              <TableRow key={term.id} hover>
                <TableCell><strong>{term.termCode}</strong></TableCell>
                <TableCell>{term.name}</TableCell>
                <TableCell>{formatDate(term.startDate)}</TableCell>
                <TableCell>{formatDate(term.endDate)}</TableCell>
                <TableCell>
                  {term.isCurrent ? <Chip label="Current" color="success" size="small" /> : <Chip label="Inactive" size="small" />}
                </TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(term)}><Edit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => {
                      if (window.confirm('Delete this term?')) deleteMutation.mutate(term.id);
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
        <DialogTitle>{editingTerm ? 'Edit Academic Term' : 'Add Academic Term'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="name" control={control} render={({ field }) => (
                  <TextField {...field} label="Term Name" placeholder="e.g., Fall 2026" fullWidth error={!!errors.name} helperText={errors.name?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="termCode" control={control} render={({ field }) => (
                  <TextField {...field} label="Term Code" placeholder="e.g., FALL26" fullWidth error={!!errors.termCode} helperText={errors.termCode?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="startDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Start Date" type="date" fullWidth error={!!errors.startDate} helperText={errors.startDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="endDate" control={control} render={({ field }) => (
                  <TextField {...field} label="End Date" type="date" fullWidth error={!!errors.endDate} helperText={errors.endDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Checkbox checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} color="primary" />}
                  label="Set as current term"
                />
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

export default TermsTab;