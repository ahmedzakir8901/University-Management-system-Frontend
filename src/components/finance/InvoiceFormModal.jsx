import React, { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Box, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../../services/financeService';
import { toast } from 'react-hot-toast';

const validationSchema = yup.object().shape({
  studentId: yup.number().required('Please select a student'),
  termId: yup.number().required('Please select a term'),
  totalAmount: yup.number().min(1).required('Amount must be greater than 0'),
  dueDate: yup.string().required('Due date is required'),
});

function InvoiceFormModal({ open, onClose }) {
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students-for-finance'],
    queryFn: financeService.getStudents,
  });

  const { data: terms = [] } = useQuery({
    queryKey: ['terms'],
    queryFn: financeService.getTerms,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { studentId: '', termId: '', totalAmount: '', dueDate: '' }
  });

  useEffect(() => {
    reset({ studentId: '', termId: '', totalAmount: '', dueDate: '' });
  }, [reset]);

  const createMutation = useMutation({
    mutationFn: financeService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice generated successfully!');
      onClose();
    },
    onError: () => toast.error('Failed to generate invoice'),
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate New Invoice</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Student Dropdown */}
            <Grid item xs={12}>
              <Controller
                name="studentId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.studentId}>
                    <InputLabel>Student</InputLabel>
                    <Select {...field} label="Student">
                      {students.map((student) => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.rollNumber} - {student.firstName} {student.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            {/* Term Dropdown */}
            <Grid item xs={12}>
              <Controller
                name="termId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.termId}>
                    <InputLabel>Academic Term</InputLabel>
                    <Select {...field} label="Academic Term">
                      {terms.map((term) => (
                        <MenuItem key={term.id} value={term.id}>
                          {term.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            {/* Amount */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="totalAmount"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Amount ($)" type="number" fullWidth error={!!errors.totalAmount} helperText={errors.totalAmount?.message} />
                )}
              />
            </Grid>
            {/* Due Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.dueDate} helperText={errors.dueDate?.message} />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={createMutation.isPending}>
          {createMutation.isPending ? <CircularProgress size={24} /> : 'Generate Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InvoiceFormModal;