import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Chip, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  LinearProgress
} from '@mui/material';
import { Add, Edit, Delete, Search, Star, TrendingUp } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { evaluationService } from '../../services/evaluationService';
import StarRating from '../../components/common/StarRating';
import RoleGate from '../../components/RoleGate';
import { toast } from 'react-hot-toast';

const schema = yup.object().shape({
  sectionId: yup.number().required('Section is required'),
  studentId: yup.number().required('Student is required'),
  ratingTeaching: yup.number().min(1).max(5).required('Please rate teaching'),
  ratingCourseContent: yup.number().min(1).max(5).required('Please rate content'),
  ratingOverall: yup.number().min(1).max(5).required('Please rate overall'),
  comments: yup.string(),
});

function EvaluationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingEval, setEditingEval] = useState(null);
  const queryClient = useQueryClient();

  const { data: evaluations, isLoading, error } = useQuery({
    queryKey: ['evaluations'],
    queryFn: evaluationService.getEvaluations,
  });

  const { data: sections = [] } = useQuery({ queryKey: ['sections-lookup'], queryFn: evaluationService.getSections });
  const { data: courses = [] } = useQuery({ queryKey: ['courses-lookup'], queryFn: evaluationService.getCourses });
  const { data: students = [] } = useQuery({ queryKey: ['students-lookup'], queryFn: evaluationService.getStudents });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { sectionId: '', studentId: '', ratingTeaching: 0, ratingCourseContent: 0, ratingOverall: 0, comments: '' }
  });

  const deleteMutation = useMutation({
    mutationFn: evaluationService.deleteEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast.success('Evaluation deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: evaluationService.createEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast.success('Thank you for your feedback!');
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => evaluationService.updateEvaluation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      toast.success('Evaluation updated!');
      handleClose();
    },
  });

  const handleAdd = () => {
    setEditingEval(null);
    reset({ sectionId: '', studentId: '', ratingTeaching: 0, ratingCourseContent: 0, ratingOverall: 0, comments: '' });
    setOpenModal(true);
  };

  const handleEdit = (evaluation) => {
    setEditingEval(evaluation);
    reset(evaluation);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingEval(null);
  };

  const onSubmit = (data) => {
    if (editingEval) updateMutation.mutate({ id: editingEval.id, data });
    else createMutation.mutate(data);
  };

  const getStudentLabel = (id) => {
    const s = students.find(s => s.id === id);
    return s ? `${s.rollNumber} - ${s.firstName} ${s.lastName}` : 'Unknown';
  };

  const getSectionLabel = (id) => {
    const s = sections.find(s => s.id === id);
    if (!s) return 'Unknown';
    const c = courses.find(c => c.id === s.courseId);
    return `${c?.code || 'N/A'} - Section ${s.sectionName}`;
  };

  const filtered = (evaluations || []).filter(e =>
    getStudentLabel(e.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSectionLabel(e.sectionId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aggregate stats
  const getStats = () => {
    if (!evaluations || evaluations.length === 0) {
      return { avgTeaching: 0, avgContent: 0, avgOverall: 0, count: 0 };
    }
    const count = evaluations.length;
    const avgTeaching = evaluations.reduce((sum, e) => sum + e.ratingTeaching, 0) / count;
    const avgContent = evaluations.reduce((sum, e) => sum + e.ratingCourseContent, 0) / count;
    const avgOverall = evaluations.reduce((sum, e) => sum + e.ratingOverall, 0) / count;
    return {
      avgTeaching: avgTeaching.toFixed(2),
      avgContent: avgContent.toFixed(2),
      avgOverall: avgOverall.toFixed(2),
      count,
    };
  };

  const stats = getStats();

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading evaluations.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Course Evaluations</Typography>
        <RoleGate allowedRoles={['ADMIN', 'STUDENT']}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Submit Evaluation</Button>
        </RoleGate>
      </Box>

      {/* Aggregate Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Teaching Quality</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Star sx={{ color: '#FFB400' }} />
                <Typography variant="h5" fontWeight="bold">{stats.avgTeaching}</Typography>
              </Box>
              <StarRating value={Number(stats.avgTeaching)} readOnly size="small" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Course Content</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Star sx={{ color: '#FFB400' }} />
                <Typography variant="h5" fontWeight="bold">{stats.avgContent}</Typography>
              </Box>
              <StarRating value={Number(stats.avgContent)} readOnly size="small" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Overall Rating</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <TrendingUp sx={{ color: '#1976d2' }} />
                <Typography variant="h5" fontWeight="bold">{stats.avgOverall}</Typography>
              </Box>
              <StarRating value={Number(stats.avgOverall)} readOnly size="small" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="caption" color="textSecondary">Total Submissions</Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{stats.count}</Typography>
              <Typography variant="caption" color="textSecondary">evaluations received</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth size="small" placeholder="Search by student or section..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
        />
      </Box>

      {/* Evaluations Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Section</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Teaching</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Overall</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((evaluation) => (
              <TableRow key={evaluation.id} hover>
                <TableCell><strong>{getSectionLabel(evaluation.sectionId)}</strong></TableCell>
                <TableCell>{getStudentLabel(evaluation.studentId)}</TableCell>
                <TableCell><StarRating value={evaluation.ratingTeaching} readOnly size="small" /></TableCell>
                <TableCell><StarRating value={evaluation.ratingCourseContent} readOnly size="small" /></TableCell>
                <TableCell><StarRating value={evaluation.ratingOverall} readOnly size="small" /></TableCell>
                <TableCell sx={{ maxWidth: 250 }}>
                  <Typography variant="body2" noWrap title={evaluation.comments}>
                    {evaluation.comments || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <RoleGate allowedRoles={['ADMIN', 'STUDENT']}>
                    <IconButton size="small" color="secondary" onClick={() => handleEdit(evaluation)}><Edit /></IconButton>
                    <RoleGate allowedRoles={['ADMIN']}>
                      <IconButton size="small" color="error" onClick={() => {
                        if (window.confirm('Delete this evaluation?')) deleteMutation.mutate(evaluation.id);
                      }}><Delete /></IconButton>
                    </RoleGate>
                  </RoleGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form Modal */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth
        disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <DialogTitle>{editingEval ? 'Edit Evaluation' : 'Submit Course Evaluation'}</DialogTitle>
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
              <Grid size={{ xs: 12 }}>
                <Controller name="studentId" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.studentId}>
                    <InputLabel>Student</InputLabel>
                    <Select {...field} label="Student">
                      {students.map(s => (
                        <MenuItem key={s.id} value={s.id}>{s.rollNumber} - {s.firstName} {s.lastName}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )} />
              </Grid>

              {/* Star Ratings */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" gutterBottom>Teaching Quality</Typography>
                <Controller name="ratingTeaching" control={control} render={({ field }) => (
                  <StarRating value={field.value} onChange={(e, val) => field.onChange(val)} />
                )} />
                {errors.ratingTeaching && (
                  <Typography variant="caption" color="error">{errors.ratingTeaching.message}</Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" gutterBottom>Course Content</Typography>
                <Controller name="ratingCourseContent" control={control} render={({ field }) => (
                  <StarRating value={field.value} onChange={(e, val) => field.onChange(val)} />
                )} />
                {errors.ratingCourseContent && (
                  <Typography variant="caption" color="error">{errors.ratingCourseContent.message}</Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" gutterBottom>Overall Rating</Typography>
                <Controller name="ratingOverall" control={control} render={({ field }) => (
                  <StarRating value={field.value} onChange={(e, val) => field.onChange(val)} />
                )} />
                {errors.ratingOverall && (
                  <Typography variant="caption" color="error">{errors.ratingOverall.message}</Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller name="comments" control={control} render={({ field }) => (
                  <TextField {...field} label="Comments (optional)" fullWidth multiline rows={3} />
                )} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
            {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={24} /> : (editingEval ? 'Update' : 'Submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EvaluationsPage;