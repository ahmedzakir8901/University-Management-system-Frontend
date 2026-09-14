import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Paper, Stepper, Step, StepLabel, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, Link, CircularProgress, Chip
} from '@mui/material';
import {
  Email, Lock, Visibility, VisibilityOff, ArrowBack, CheckCircle,
  VpnKey, Info
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/authService';

const steps = ['Enter Email', 'Verify OTP', 'New Password'];

// ============ VALIDATION SCHEMAS ============
const emailSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const otpSchema = yup.object().shape({
  otp: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required'),
});

const passwordSchema = yup.object().shape({
  newPassword: yup.string()
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Must contain uppercase')
    .matches(/[0-9]/, 'Must contain a number')
    .required('New password required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm password'),
});

function ForgotPassword() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const emailForm = useForm({
    resolver: yupResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const handleSendOtp = async (data) => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.requestPasswordReset(data.email);

      setEmail(data.email);
      if (response.mockOtp) {
        toast.success(`OTP sent! (Mock code: ${response.mockOtp})`, { duration: 8000 });
      } else {
        toast.success('OTP sent to your email!');
      }
      setActiveStep(1);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data) => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.verifyOtp(email, data.otp);
      setResetToken(response.resetToken);
      toast.success('OTP verified!');
      setActiveStep(2);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    try {
      setLoading(true);
      setError('');
      await authService.resetPassword(email, data.newPassword, resetToken);
      toast.success('Password reset successfully! Please log in.');
      setActiveStep(3);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/login');
    } else {
      setActiveStep(activeStep - 1);
      setError('');
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
        sx={{ width: '100%', maxWidth: 520, p: { xs: 3, md: 5 }, borderRadius: 3 }}
      >
        {/* Back button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          size="small"
          sx={{ mb: 2 }}
        >
          {activeStep === 0 ? 'Back to Login' : 'Back'}
        </Button>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {activeStep === 3 ? 'Success!' : 'Reset Password'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeStep === 0 && 'Enter your email to receive an OTP'}
            {activeStep === 1 && `We sent a 6-digit code to ${email}`}
            {activeStep === 2 && 'Choose a new password for your account'}
            {activeStep === 3 && 'Your password has been reset'}
          </Typography>
        </Box>

        {/* Stepper */}
        {activeStep < 3 && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ============ STEP 1: EMAIL ============ */}
        {activeStep === 0 && (
          <Box component="form" onSubmit={emailForm.handleSubmit(handleSendOtp)}>
            <Controller
              name="email"
              control={emailForm.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  type="email"
                  fullWidth
                  autoFocus
                  error={!!emailForm.formState.errors.email}
                  helperText={emailForm.formState.errors.email?.message}
                  slotProps={{
                    input: { startAdornment: (<InputAdornment position="start"><Email fontSize="small" /></InputAdornment>) }
                  }}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
          </Box>
        )}

        {/* ============ STEP 2: OTP ============ */}
        {activeStep === 1 && (
          <Box component="form" onSubmit={otpForm.handleSubmit(handleVerifyOtp)}>
            {/* FIXED: Alert content changed to div to avoid <p> nesting <div> */}
            <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
              <Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <strong>Testing:</strong>
                <span>Use the mock OTP code</span>
                <Chip label="123456" size="small" color="primary" />
              </Box>
            </Alert>

            <Controller
              name="otp"
              control={otpForm.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="6-Digit OTP"
                  fullWidth
                  autoFocus
                  error={!!otpForm.formState.errors.otp}
                  helperText={otpForm.formState.errors.otp?.message}
                  slotProps={{
                    // FIXED: inputProps → htmlInput (MUI v7 uses htmlInput inside slotProps)
                    htmlInput: {
                      maxLength: 6,
                      style: { letterSpacing: 8, textAlign: 'center', fontSize: 20 },
                    },
                    input: { startAdornment: (<InputAdornment position="start"><VpnKey fontSize="small" /></InputAdornment>) }
                  }}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
              Didn't get the code?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => handleSendOtp({ email })}
                underline="hover"
              >
                Resend
              </Link>
            </Typography>
          </Box>
        )}

        {/* ============ STEP 3: NEW PASSWORD ============ */}
        {activeStep === 2 && (
          <Box component="form" onSubmit={passwordForm.handleSubmit(handleResetPassword)}>
            <Controller
              name="newPassword"
              control={passwordForm.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="New Password"
                  type={showNewPwd ? 'text' : 'password'}
                  fullWidth
                  autoFocus
                  margin="normal"
                  error={!!passwordForm.formState.errors.newPassword}
                  helperText={passwordForm.formState.errors.newPassword?.message || 'Min 8 chars, 1 uppercase, 1 number'}
                  slotProps={{
                    input: {
                      startAdornment: (<InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPwd(!showNewPwd)} edge="end" size="small">
                            {showNewPwd ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={passwordForm.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm New Password"
                  type={showConfirmPwd ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!passwordForm.formState.errors.confirmPassword}
                  helperText={passwordForm.formState.errors.confirmPassword?.message}
                  slotProps={{
                    input: {
                      startAdornment: (<InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPwd(!showConfirmPwd)} edge="end" size="small">
                            {showConfirmPwd ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        )}

        {/* ============ STEP 4: SUCCESS ============ */}
        {activeStep === 3 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Password Reset Complete
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Redirecting you to login...
            </Typography>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Bottom link (only on step 0) */}
        {activeStep === 0 && (
          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Remember your password?{' '}
            <Link component={RouterLink} to="/login" fontWeight="bold" underline="hover">
              Log In
            </Link>
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default ForgotPassword;