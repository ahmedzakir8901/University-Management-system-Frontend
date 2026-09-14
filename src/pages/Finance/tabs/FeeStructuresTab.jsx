// src/pages/Finance/tabs/FeeStructuresTab.jsx
import React, { useState } from 'react';
import {
  Box, Typography, Button, IconButton, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  FormControl, InputLabel, Select, MenuItem, TextField, Chip, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Info, Calculate } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { financeService } from '../../../services/financeService';
import { formatCurrency } from '../../../utils/formatCurrency';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';
import ExportButton from '../../../components/common/ExportButton';

const SAMPLE_CREDITS = 15;

const schema = yup.object().shape({
  departmentId: yup.number().required('Department is required'),
  termId: yup.number().required('Term is required'),
  tuitionFeePerCredit: yup.number().min(0, 'Cannot be negative').required('Tuition fee is required'),
  libraryFee: yup.number().min(0).default(0),
  labFee: yup.number().min(0).default(0),
  hostelFee: yup.number().min(0).default(0),
});

function FeeStructuresTab() {
  const [openModal, setOpenModal] = useState(false);
  const [editingFS, setEditingFS] = useState(null);
  const queryClient = useQueryClient();

  const { data: feeStructures = [], isLoading, error } = useQuery({
    queryKey: ['feeStructures'],
    queryFn: financeService.getFeeStructures,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments-lookup'],
    queryFn: financeService.getDepartments,
  });

  const { data: terms = [] } = useQuery({
    queryKey: ['terms-lookup'],
    queryFn: financeService.getTerms,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      departmentId: '',
      termId: '',
      tuitionFeePerCredit: 0,
      libraryFee: 0,
      labFee: 0,
      hostelFee: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: financeService.createFeeStructure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
      toast.success('Fee structure added!');
      handleClose();
    },
    onError: (err) => toast.error(err.message || 'Failed to add'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => financeService.updateFeeStructure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
      toast.success('Fee structure updated!');
      handleClose();
    },
    onError: (err) => toast.error(err.message || 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: financeService.deleteFeeStructure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
      toast.success('Fee structure deleted');
    },
  });

  const handleAdd = () => {
    setEditingFS(null);
    reset({ departmentId: '', termId: '', tuitionFeePerCredit: 0, libraryFee: 0, labFee: 0, hostelFee: 0 });
    setOpenModal(true);
  };

  const handleEdit = (fs) => {
    setEditingFS(fs);
    reset(fs);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingFS(null);
  };

  const onSubmit = (data) => {
    if (editingFS) updateMutation.mutate({ id: editingFS.id, data });
    else createMutation.mutate(data);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this fee structure?')) deleteMutation.mutate(id);
  };

  const getDepartmentLabel = (id) => {
    const d = departments.find(d => d.id === id);
    return d ? `${d.code} - ${d.name}` : 'Unknown';
  };

  const getTermLabel = (id) => {
    const t = terms.find(t => t.id === id);
    return t ? t.name : 'Unknown';
  };

  const computeEstimatedTotal = (fs) => {
    return (
      fs.tuitionFeePerCredit * SAMPLE_CREDITS +
      fs.libraryFee +
      fs.labFee +
      fs.hostelFee
    );
  };

  const exportRows = feeStructures.map(fs => [
    getDepartmentLabel(fs.departmentId),
    getTermLabel(fs.termId),
    formatCurrency(fs.tuitionFeePerCredit),
    formatCurrency(fs.libraryFee),
    formatCurrency(fs.labFee),
    formatCurrency(fs.hostelFee),
    formatCurrency(computeEstimatedTotal(fs)),
  ]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading fee structures.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Alert severity="info" icon={<Info />} sx={{ flex: 1, minWidth: 300 }}>
          <Typography variant="body2">
            Fee structures define the tuition rate per credit and additional fees for a
            department + term combination. The "Est. Total" column shows the estimated
            cost for <strong>{SAMPLE_CREDITS} credits</strong>.
          </Typography>
        </Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ExportButton
            title="Fee Structures Report"
            fileName="fee_structures_report"
            columns={['Department', 'Term', 'Tuition/Credit', 'Library Fee', 'Lab Fee', 'Hostel Fee', `Est. Total (${SAMPLE_CREDITS} credits)`]}
            rows={exportRows}
          />
          <RoleGate allowedRoles={['ADMIN']}>
            <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>
              Add Fee Structure
            </Button>
          </RoleGate>
        </Box>
      </Box>

      {feeStructures.length === 0 ? (
        <Alert severity="info">
          No fee structures yet. Click <strong>Add Fee Structure</strong> to create one.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell>Term</TableCell>
                <TableCell align="right">Tuition / Credit</TableCell>
                <TableCell align="right">Library Fee</TableCell>
                <TableCell align="right">Lab Fee</TableCell>
                <TableCell align="right">Hostel Fee</TableCell>
                <TableCell align="right">
                  <Tooltip title={`Total for ${SAMPLE_CREDITS} credits`}>
                    <Box component="span">Est. Total ({SAMPLE_CREDITS} cr)</Box>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeStructures.map((fs) => (
                <TableRow key={fs.id} hover>
                  <TableCell>
                    <Chip label={getDepartmentLabel(fs.departmentId)} color="primary" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{getTermLabel(fs.termId)}</TableCell>
                  <TableCell align="right">{formatCurrency(fs.tuitionFeePerCredit)}</TableCell>
                  <TableCell align="right">{formatCurrency(fs.libraryFee)}</TableCell>
                  <TableCell align="right">{formatCurrency(fs.labFee)}</TableCell>
                  <TableCell align="right">{formatCurrency(fs.hostelFee)}</TableCell>
                  <TableCell align="right">
                    <Chip label={formatCurrency(computeEstimatedTotal(fs))} color="success" size="small" icon={<Calculate />} />
                  </TableCell>
                  <TableCell align="right">
                    <RoleGate allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="secondary" onClick={() => handleEdit(fs)}><Edit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(fs.id)}><Delete /></IconButton>
                    </RoleGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth
        disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <DialogTitle>{editingFS ? 'Edit Fee Structure' : 'Add Fee Structure'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="departmentId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.departmentId}>
                    <InputLabel>Department</InputLabel>
                    <Select {...field} label="Department">
                      {departments.map((d) => (
                        <MenuItem key={d.id} value={d.id}>{d.code} - {d.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="termId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.termId}>
                    <InputLabel>Term</InputLabel>
                    <Select {...field} label="Term">
                      {terms.map((t) => (
                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="tuitionFeePerCredit" control={control} render={({ field }) => (
                  <TextField {...field} label="Tuition Fee Per Credit ($)" type="number" fullWidth
                    error={!!errors.tuitionFeePerCredit} helperText={errors.tuitionFeePerCredit?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="libraryFee" control={control} render={({ field }) => (
                  <TextField {...field} label="Library Fee ($)" type="number" fullWidth error={!!errors.libraryFee} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="labFee" control={control} render={({ field }) => (
                  <TextField {...field} label="Lab Fee ($)" type="number" fullWidth error={!!errors.labFee} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="hostelFee" control={control} render={({ field }) => (
                  <TextField {...field} label="Hostel Fee ($)" type="number" fullWidth error={!!errors.hostelFee} />
                )} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? <CircularProgress size={24} /> : (editingFS ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FeeStructuresTab;