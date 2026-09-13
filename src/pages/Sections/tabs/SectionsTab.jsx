import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, CircularProgress, Alert, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip, LinearProgress
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { sectionService } from '../../../services/sectionService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';
import ExportButton from '../../../components/common/ExportButton'; // <-- NEW

const schema = yup.object().shape({
  courseId: yup.number().required('Please select a course'),
  termId: yup.number().required('Please select a term'),
  sectionName: yup.string().required('Section name is required').max(5, 'Max 5 chars'),
  facultyId: yup.number().required('Please select a faculty'),
  maxCapacity: yup.number().min(1).max(500).required('Capacity is required'),
});

function SectionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const queryClient = useQueryClient();

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ['sections'],
    queryFn: sectionService.getSections,
  });

  const { data: courses = [] } = useQuery({ queryKey: ['courses-lookup'], queryFn: sectionService.getCourses });
  const { data: faculty = [] } = useQuery({ queryKey: ['faculty-lookup'], queryFn: sectionService.getFaculty });
  const { data: terms = [] } = useQuery({ queryKey: ['terms-lookup'], queryFn: sectionService.getTerms });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { courseId: '', termId: '', sectionName: 'A', facultyId: '', maxCapacity: 40 }
  });

  const deleteMutation = useMutation({
    mutationFn: sectionService.deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: sectionService.createSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section added!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => sectionService.updateSection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingSection(null);
    reset({ courseId: '', termId: '', sectionName: 'A', facultyId: '', maxCapacity: 40 });
    setOpenModal(true);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    reset(section);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingSection(null);
  };

  const onSubmit = (data) => {
    if (editingSection) updateMutation.mutate({ id: editingSection.id, data });
    else createMutation.mutate(data);
  };

  const getCourseName = (id) => courses.find(c => c.id === id)?.code || 'Unknown';
  const getFacultyName = (id) => {
    const f = faculty.find(f => f.id === id);
    return f ? `${f.firstName} ${f.lastName}` : 'Unassigned';
  };
  const getTermName = (id) => terms.find(t => t.id === id)?.name || 'Unknown';

  const filtered = (sections || []).filter(s =>
    getCourseName(s.courseId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.sectionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading sections.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <TextField
          size="small" placeholder="Search by course code or section..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ExportButton
            title="Sections Report"
            fileName="sections_report"
            columns={['Course', 'Term', 'Section', 'Faculty', 'Enrollment']}
            rows={filtered.map(s => [
              getCourseName(s.courseId),
              getTermName(s.termId),
              s.sectionName,
              getFacultyName(s.facultyId),
              `${s.currentEnrollment}/${s.maxCapacity}`,
            ])}
          />
          <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
            <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Section</Button>
          </RoleGate>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Term</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>Enrollment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((section) => {
              const percent = (section.currentEnrollment / section.maxCapacity) * 100;
              return (
                <TableRow key={section.id} hover>
                  <TableCell><strong>{getCourseName(section.courseId)}</strong></TableCell>
                  <TableCell>{getTermName(section.termId)}</TableCell>
                  <TableCell>Section {section.sectionName}</TableCell>
                  <TableCell>{getFacultyName(section.facultyId)}</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        color={percent >= 90 ? 'error' : percent >= 70 ? 'warning' : 'primary'}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Chip
                        label={`${section.currentEnrollment}/${section.maxCapacity}`}
                        size="small"
                        color={percent >= 90 ? 'error' : 'default'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                      <IconButton size="small" color="secondary" onClick={() => handleEdit(section)}><Edit /></IconButton>
                      <RoleGate allowedRoles={['ADMIN']}>
                        <IconButton size="small" color="error" onClick={() => {
                          if (window.confirm('Delete this section?')) deleteMutation.mutate(section.id);
                        }}><Delete /></IconButton>
                      </RoleGate>
                    </RoleGate>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth
        disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <DialogTitle>{editingSection ? 'Edit Section' : 'Add Section'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Controller name="courseId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.courseId}>
                    <InputLabel>Course</InputLabel>
                    <Select {...field} label="Course">
                      {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.code} - {c.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller name="sectionName" control={control} render={({ field }) => (
                  <TextField {...field} label="Section" placeholder="A/B/C" fullWidth error={!!errors.sectionName} helperText={errors.sectionName?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="termId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.termId}>
                    <InputLabel>Term</InputLabel>
                    <Select {...field} label="Term">
                      {terms.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="maxCapacity" control={control} render={({ field }) => (
                  <TextField {...field} label="Max Capacity" type="number" fullWidth error={!!errors.maxCapacity} helperText={errors.maxCapacity?.message} />
                )} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller name="facultyId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.facultyId}>
                    <InputLabel>Assigned Faculty</InputLabel>
                    <Select {...field} label="Assigned Faculty">
                      {faculty.map(f => (
                        <MenuItem key={f.id} value={f.id}>{f.firstName} {f.lastName} ({f.employeeId})</MenuItem>
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

export default SectionsTab;