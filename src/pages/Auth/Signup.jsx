import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Alert, Grid,
  FormControl, InputLabel, Select, MenuItem,
  InputAdornment, IconButton, Divider, Paper, Link,
  CircularProgress, Checkbox, FormControlLabel
} from '@mui/material';
import {
  Visibility, VisibilityOff, Person, Email, Phone, Lock,
  ArrowBack, Badge
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/authService';

// ==================== HELPERS ====================
const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate)) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const TODAY = new Date().toISOString().split('T')[0];

// ==================== VALIDATION SCHEMA ====================
const schema = yup.object().shape({
  firstName: yup.string().required('First name is required').max(50),
  middleName: yup.string().max(50),
  lastName: yup.string().required('Last name is required').max(50),
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain an uppercase letter')
    .matches(/[0-9]/, 'Must contain a number')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords do not match')
    .required('Please confirm your password'),
  gender: yup.string().required('Gender is required'),
  dateOfBirth: yup.string()
    .required('Date of birth is required')
    .test('min-age', 'You must be at least 15 years old', (value) => {
      if (!value) return false;
      return calculateAge(value) >= 15;
    }),
  phoneNumber: yup.string().matches(/^[0-9+\-\s()]*$/, 'Invalid phone number'),
  role: yup.string().required('Please select a role'),
  terms: yup.boolean().oneOf([true], 'You must accept the terms'),
});

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '', middleName: '', lastName: '',
      email: '', password: '', confirmPassword: '',
      gender: '', dateOfBirth: '', phoneNumber: '',
      role: 'STUDENT', terms: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError('');

      const { confirmPassword, terms, ...userData } = data;

      await authService.signup(userData);

      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 700,
          p: { xs: 3, md: 5 },
          borderRadius: 3,
        }}
      >
        {/* Back to Login */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/login')}
          sx={{ mb: 2 }}
          size="small"
        >
          Back to Login
        </Button>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join the University Management System
          </Typography>
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* ===== Name Section ===== */}
            <Grid size={{ xs: 12, sm: 5 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name *"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    slotProps={{
                      input: { startAdornment: (<InputAdornment position="start"><Person fontSize="small" /></InputAdornment>) }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Controller
                name="middleName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Middle Name" fullWidth error={!!errors.middleName} helperText={errors.middleName?.message} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name *"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>

            {/* ===== Email (full width) ===== */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email *"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    slotProps={{
                      input: { startAdornment: (<InputAdornment position="start"><Email fontSize="small" /></InputAdornment>) }
                    }}
                  />
                )}
              />
            </Grid>

            {/* ===== Phone (half) + Gender (half) ===== */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    slotProps={{
                      input: { startAdornment: (<InputAdornment position="start"><Phone fontSize="small" /></InputAdornment>) }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel>Gender *</InputLabel>
                    <Select {...field} label="Gender *">
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* ===== Date of Birth (half) + Role (half) ===== */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => {
                  const age = calculateAge(field.value);
                  return (
                    <TextField
                      {...field}
                      label="Date of Birth *"
                      type="date"
                      fullWidth
                      error={!!errors.dateOfBirth}
                      helperText={
                        errors.dateOfBirth?.message ||
                        (age !== null ? `Age: ${age} years` : 'Format: MM/DD/YYYY')
                      }
                      slotProps={{
                        inputLabel: { shrink: true },
                        htmlInput: {
                          min: '1900-01-01',
                          max: TODAY,
                        },
                      }}
                    />
                  );
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>I am a *</InputLabel>
                    <Select {...field} label="I am a *">
                      <MenuItem value="STUDENT">Student</MenuItem>
                      <MenuItem value="FACULTY">Faculty Member</MenuItem>
                      <MenuItem value="LIBRARIAN">Librarian</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* ===== Password Section ===== */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">Password</Typography>
              </Divider>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password *"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message || 'Min 8 chars, 1 uppercase, 1 number'}
                    slotProps={{
                      input: {
                        startAdornment: (<InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm Password *"
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    slotProps={{
                      input: {
                        startAdornment: (<InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* ===== Terms ===== */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                  <>
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                      label={
                        <Typography variant="body2">
                          I agree to the <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>
                        </Typography>
                      }
                    />
                    {errors.terms && (
                      <Typography variant="caption" color="error" display="block">
                        {errors.terms.message}
                      </Typography>
                    )}
                  </>
                )}
              />
            </Grid>

            {/* ===== Submit ===== */}
            <Grid size={{ xs: 12 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 1, py: 1.5 }}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Badge />}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Grid>

            {/* ===== Login link ===== */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" fontWeight="bold">
                  Log In
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default Signup;