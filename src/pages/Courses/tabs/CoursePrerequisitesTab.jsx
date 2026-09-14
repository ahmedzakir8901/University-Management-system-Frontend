import React, { useState } from 'react';
import {
  Box, Button, IconButton, CircularProgress, Alert, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  FormControl, InputLabel, Select, MenuItem, Chip, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputAdornment, TextField
} from '@mui/material';
import { Add, Delete, School, Info } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { courseService } from '../../../services/courseService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';
import ExportButton from '../../../components/common/ExportButton';

const GRADES = ['A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

const schema = yup.object().shape({
  prerequisiteCourseId: yup.number()
    .required('Please select a prerequisite course')
    .min(1, 'Please select a course'),
  minGrade: yup.string().required('Please select a minimum grade'),
});

function CoursePrerequisitesTab() {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all courses (for dropdowns)
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAllCourses,
  });

  // Fetch prerequisites for the selected course
  const { data: prerequisites = [], isLoading, error } = useQuery({
    queryKey: ['prerequisites', selectedCourseId],
    queryFn: () => courseService.getPrerequisitesByCourse(selectedCourseId),
    enabled: !!selectedCourseId, // only run when a course is selected
  });

  // Fetch ALL prerequisites (for the export button)
  const { data: allPrerequisites = [] } = useQuery({
    queryKey: ['allPrerequisites'],
    queryFn: courseService.getAllPrerequisites,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { prerequisiteCourseId: '', minGrade: 'C' },
  });

  const addMutation = useMutation({
    mutationFn: courseService.createPrerequisite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prerequisites', selectedCourseId] });
      queryClient.invalidateQueries({ queryKey: ['allPrerequisites'] });
      toast.success('Prerequisite added!');
      handleClose();
    },
    onError: (err) => toast.error(err.message || 'Failed to add prerequisite'),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ courseId, prerequisiteCourseId }) =>
      courseService.deletePrerequisite(courseId, prerequisiteCourseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prerequisites', selectedCourseId] });
      queryClient.invalidateQueries({ queryKey: ['allPrerequisites'] });
      toast.success('Prerequisite removed');
    },
  });

  const handleAdd = () => {
    reset({ prerequisiteCourseId: '', minGrade: 'C' });
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const onSubmit = (data) => {
    addMutation.mutate({
      courseId: Number(selectedCourseId),
      prerequisiteCourseId: Number(data.prerequisiteCourseId),
      minGrade: data.minGrade,
    });
  };

  // Get course label by ID
  const getCourseLabel = (id) => {
    const c = courses.find(c => c.id === id);
    return c ? `${c.code} - ${c.title}` : 'Unknown';
  };

  const getCourseCode = (id) => courses.find(c => c.id === id)?.code || 'Unknown';

  // Filter out: the selected course itself + already-added prerequisites
  const availableCourses = courses.filter(
    (c) =>
      c.id !== Number(selectedCourseId) &&
      !prerequisites.some((p) => p.prerequisiteCourseId === c.id)
  );

  // Format export rows
  const exportRows = (allPrerequisites || []).map((p) => [
    getCourseCode(p.courseId),
    getCourseCode(p.prerequisiteCourseId),
    p.minGrade,
  ]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 350 }}>
          <InputLabel>Select Course</InputLabel>
          <Select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            label="Select Course"
          >
            {courses.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.code} - {c.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <ExportButton
            title="Course Prerequisites Report"
            fileName="course_prerequisites_report"
            columns={['Course Code', 'Prerequisite Course Code', 'Min Grade']}
            rows={exportRows}
          />
          <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
              disabled={!selectedCourseId}
            >
              Add Prerequisite
            </Button>
          </RoleGate>
        </Box>
      </Box>

      {/* Info panel */}
      {!selectedCourseId && (
        <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
          Select a course from the dropdown above to view and manage its prerequisites.
        </Alert>
      )}

      {/* Prerequisites list */}
      {selectedCourseId && (
        <>
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Showing prerequisites for
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {getCourseLabel(selectedCourseId)}
            </Typography>
          </Paper>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">Error loading prerequisites.</Alert>
          ) : prerequisites.length === 0 ? (
            <Alert severity="success">
              This course has no prerequisites. Click <strong>Add Prerequisite</strong> to add one.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Prerequisite Course</TableCell>
                    <TableCell>Course Title</TableCell>
                    <TableCell align="center">Minimum Grade</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prerequisites.map((p) => {
                    const prereqCourse = courses.find((c) => c.id === p.prerequisiteCourseId);
                    return (
                      <TableRow key={p.prerequisiteCourseId} hover>
                        <TableCell>
                          <Chip
                            icon={<School />}
                            label={prereqCourse?.code || 'N/A'}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{prereqCourse?.title || 'Unknown'}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={p.minGrade}
                            color={p.minGrade === 'F' ? 'error' : 'success'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                if (window.confirm(`Remove ${prereqCourse?.code} as a prerequisite?`)) {
                                  deleteMutation.mutate({
                                    courseId: Number(selectedCourseId),
                                    prerequisiteCourseId: p.prerequisiteCourseId,
                                  });
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </RoleGate>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Add Prerequisite Dialog */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth
        disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <DialogTitle>
          Add Prerequisite to {getCourseCode(selectedCourseId)}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="prerequisiteCourseId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.prerequisiteCourseId}>
                      <InputLabel>Prerequisite Course</InputLabel>
                      <Select {...field} label="Prerequisite Course">
                        {availableCourses.length === 0 ? (
                          <MenuItem disabled value="">
                            No available courses to add
                          </MenuItem>
                        ) : (
                          availableCourses.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              {c.code} - {c.title}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {errors.prerequisiteCourseId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.prerequisiteCourseId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="minGrade"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.minGrade}>
                      <InputLabel>Minimum Grade Required</InputLabel>
                      <Select {...field} label="Minimum Grade Required">
                        {GRADES.map((g) => (
                          <MenuItem key={g} value={g}>
                            {g} {g === 'D' ? '(or higher)' : `or higher`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  A student must have completed the prerequisite course with at least this grade before enrolling in the selected course.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={addMutation.isPending || availableCourses.length === 0}
          >
            {addMutation.isPending ? <CircularProgress size={24} /> : 'Add Prerequisite'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CoursePrerequisitesTab;