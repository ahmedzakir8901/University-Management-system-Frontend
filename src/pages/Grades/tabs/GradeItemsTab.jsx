import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip, LinearProgress, TextField
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { gradeService } from '../../../services/gradeService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';
import ExportButton from '../../../components/common/ExportButton'; // <-- NEW

const ITEM_TYPES = ['ASSIGNMENT', 'QUIZ', 'MIDTERM', 'FINAL_EXAM', 'PROJECT', 'PRESENTATION'];

const schema = yup.object().shape({
  sectionId: yup.number().required('Please select a section'),
  title: yup.string().required('Title is required'),
  itemType: yup.string().required('Please select a type'),
  maxMarks: yup.number().min(1).required('Max marks required'),
  weightagePercent: yup.number().min(1).max(100).required('Weightage required'),
  dueDate: yup.string().required('Due date required'),
});

function GradeItemsTab() {
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();

  const { data: gradeItems, isLoading, error } = useQuery({
    queryKey: ['gradeItems'],
    queryFn: gradeService.getGradeItems,
  });

  const { data: sections = [] } = useQuery({ queryKey: ['sections-lookup'], queryFn: gradeService.getSections });
  const { data: courses = [] } = useQuery({ queryKey: ['courses-lookup'], queryFn: gradeService.getCourses });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { sectionId: '', title: '', itemType: 'ASSIGNMENT', maxMarks: 100, weightagePercent: 10, dueDate: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: gradeService.deleteGradeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradeItems'] });
      toast.success('Item deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: gradeService.createGradeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradeItems'] });
      toast.success('Item added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => gradeService.updateGradeItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gradeItems'] });
      toast.success('Item updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingItem(null);
    reset({ sectionId: '', title: '', itemType: 'ASSIGNMENT', maxMarks: 100, weightagePercent: 10, dueDate: '' });
    setOpenModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    reset({ ...item, dueDate: item.dueDate ? item.dueDate.slice(0, 16) : '' });
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingItem(null);
  };

  const onSubmit = (data) => {
    if (editingItem) updateMutation.mutate({ id: editingItem.id, data });
    else createMutation.mutate(data);
  };

  const getSectionLabel = (sectionId) => {
    const s = sections.find(s => s.id === sectionId);
    if (!s) return 'Unknown';
    const c = courses.find(c => c.id === s.courseId);
    return `${c?.code || 'N/A'} - Section ${s.sectionName}`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ASSIGNMENT': return 'primary';
      case 'QUIZ': return 'info';
      case 'MIDTERM': return 'warning';
      case 'FINAL_EXAM': return 'error';
      case 'PROJECT': return 'secondary';
      default: return 'default';
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading grade items.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <ExportButton
          title="Grade Items Report"
          fileName="grade_items_report"
          columns={['Section', 'Title', 'Type', 'Max Marks', 'Weightage', 'Due Date']}
          rows={(gradeItems || []).map(g => [
            getSectionLabel(g.sectionId),
            g.title,
            g.itemType,
            g.maxMarks,
            `${g.weightagePercent}%`,
            new Date(g.dueDate).toLocaleString(),
          ])}
        />
        <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Grade Item</Button>
        </RoleGate>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Section</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Max Marks</TableCell>
              <TableCell>Weightage</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gradeItems?.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{getSectionLabel(item.sectionId)}</TableCell>
                <TableCell><strong>{item.title}</strong></TableCell>
                <TableCell>
                  <Chip label={item.itemType.replace('_', ' ')} color={getTypeColor(item.itemType)} size="small" />
                </TableCell>
                <TableCell>{item.maxMarks}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                    <LinearProgress
                      variant="determinate"
                      value={item.weightagePercent}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <span>{item.weightagePercent}%</span>
                  </Box>
                </TableCell>
                <TableCell>{new Date(item.dueDate).toLocaleString()}</TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(item)}><Edit /></IconButton>
                    <RoleGate allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="error" onClick={() => {
                        if (window.confirm('Delete this grade item?')) deleteMutation.mutate(item.id);
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
        <DialogTitle>{editingItem ? 'Edit Grade Item' : 'Add Grade Item'}</DialogTitle>
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
                <Controller name="title" control={control} render={({ field }) => (
                  <TextField {...field} label="Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="itemType" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.itemType}>
                    <InputLabel>Type</InputLabel>
                    <Select {...field} label="Type">
                      {ITEM_TYPES.map(t => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="maxMarks" control={control} render={({ field }) => (
                  <TextField {...field} label="Max Marks" type="number" fullWidth error={!!errors.maxMarks} helperText={errors.maxMarks?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="weightagePercent" control={control} render={({ field }) => (
                  <TextField {...field} label="Weightage (%)" type="number" fullWidth error={!!errors.weightagePercent} helperText={errors.weightagePercent?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="dueDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Due Date & Time" type="datetime-local" fullWidth
                    error={!!errors.dueDate} helperText={errors.dueDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }} />
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

export default GradeItemsTab;