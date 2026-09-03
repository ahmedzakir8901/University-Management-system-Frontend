import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Box, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseService } from '../../services/courseService';
import { toast } from 'react-hot-toast';

const validationSchema = yup.object().shape({
  code: yup.string().required('Course code is required'),
  title: yup.string().required('Course title is required'),
  departmentId: yup.number().required('Please select a department'),
  credits: yup.number().min(1).max(6).required('Credits must be between 1 and 6'),
});

function CourseFormModal({ open, onClose, course }) {
  const queryClient = useQueryClient();
  const [isElective, setIsElective] = useState(false);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: courseService.getAllDepartments,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { code: '', title: '', departmentId: '', credits: 3, lectureHours: 3, labHours: 0 }
  });

  useEffect(() => {
    if (course) {
      reset({
        code: course.code,
        title: course.title,
        departmentId: course.departmentId,
        credits: course.credits,
        lectureHours: course.lectureHours,
        labHours: course.labHours,
      });
      setIsElective(course.isElective);
    } else {
      reset({ code: '', title: '', departmentId: '', credits: 3, lectureHours: 3, labHours: 0 });
      setIsElective(false);
    }
  }, [course, reset]);

  const createMutation = useMutation({
    mutationFn: (data) => courseService.createCourse({ ...data, isElective }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course added successfully!');
      onClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => courseService.updateCourse(id, { ...data, isElective }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully!');
      onClose();
    }
  });

  const onSubmit = (data) => {
    if (course) {
      updateMutation.mutate({ id: course.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{course ? 'Edit Course' : 'Add New Course'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Course Code" fullWidth error={!!errors.code} helperText={errors.code?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Course Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.departmentId}>
                    <InputLabel>Department</InputLabel>
                    <Select {...field} label="Department">
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="credits"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Credits" type="number" fullWidth error={!!errors.credits} helperText={errors.credits?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="lectureHours"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Lecture Hours" type="number" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="labHours"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Lab Hours" type="number" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isElective}
                    onChange={(e) => setIsElective(e.target.checked)}
                    color="primary"
                  />
                }
                label="Is this an Elective Course?"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={24} /> : (course ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CourseFormModal;