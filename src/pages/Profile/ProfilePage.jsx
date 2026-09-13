import React, { useState, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, Avatar, Button, TextField, Divider,
  CircularProgress, Alert, Chip, Card, CardContent, IconButton, Tabs, Tab,
  InputAdornment, IconButton as MuiIconButton
} from '@mui/material';
import {
  Edit, Save, Cancel, PhotoCamera, Lock, Person, Email, Phone,
  Cake, Home, Badge, CalendarMonth, Visibility, VisibilityOff
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'react-hot-toast';

// ==================== VALIDATION SCHEMAS ====================
const profileSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  address: yup.string(),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string()
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Must contain an uppercase letter')
    .matches(/[0-9]/, 'Must contain a number')
    .required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

// ==================== MAIN COMPONENT ====================
function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [tabValue, setTabValue] = useState(0);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Fetch profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
  });

  // Profile form
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', address: '',
    },
  });

  // Populate form when profile loads
  React.useEffect(() => {
    if (profile) {
      resetProfile({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        address: profile.address || '',
      });
    }
  }, [profile, resetProfile]);

  // Password form
  const {
    control: pwdControl,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  // ==================== MUTATIONS ====================
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      profileService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      resetPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(err.message || 'Failed to change password'),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: profileService.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile picture updated!');
    },
  });

  const onProfileSubmit = (data) => updateProfileMutation.mutate(data);
  const onPasswordSubmit = (data) => changePasswordMutation.mutate(data);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be smaller than 2MB');
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  // ==================== LOADING / ERROR ====================
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load profile.</Alert>;
  }

  // ==================== HELPERS ====================
  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'FACULTY': return 'primary';
      case 'STUDENT': return 'success';
      default: return 'default';
    }
  };

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <Box>
      {/* Page Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View and manage your personal information.
      </Typography>

      {/* Profile Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexWrap: 'wrap',
        }}
      >
        {/* Avatar with upload button */}
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={profile.profilePictureUrl}
            sx={{
              width: 100, height: 100,
              bgcolor: 'primary.main',
              fontSize: 36,
              fontWeight: 'bold',
            }}
          >
            {initials}
          </Avatar>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
          <MuiIconButton
            size="small"
            onClick={handleAvatarClick}
            disabled={uploadAvatarMutation.isPending}
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {uploadAvatarMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <PhotoCamera fontSize="small" />}
          </MuiIconButton>
        </Box>

        {/* Name & Role */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {profile.firstName} {profile.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {profile.email}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={profile.role}
              color={getRoleColor(profile.role)}
              size="small"
              icon={<Badge />}
            />
            {profile.department && (
              <Chip label={profile.department} size="small" variant="outlined" />
            )}
          </Box>
        </Box>

        {/* Meta info */}
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Member since
          </Typography>
          <Typography variant="body2" fontWeight="600">
            {formatDate(profile.joinedAt)}
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<Lock />} label="Security" />
        </Tabs>

        <Divider />

        <Box sx={{ p: 3 }}>
          {/* ==================== TAB 1: PERSONAL INFO ==================== */}
          {tabValue === 0 && (
            <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="firstName"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="First Name"
                        fullWidth
                        error={!!profileErrors.firstName}
                        helperText={profileErrors.firstName?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="lastName"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Last Name"
                        fullWidth
                        error={!!profileErrors.lastName}
                        helperText={profileErrors.lastName?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="email"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email"
                        type="email"
                        fullWidth
                        error={!!profileErrors.email}
                        helperText={profileErrors.email?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="phone"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Phone"
                        fullWidth
                        error={!!profileErrors.phone}
                        helperText={profileErrors.phone?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="dateOfBirth"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Date of Birth"
                        type="date"
                        fullWidth
                        error={!!profileErrors.dateOfBirth}
                        helperText={profileErrors.dateOfBirth?.message}
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Cake fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Role"
                    value={profile.role}
                    fullWidth
                    disabled
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="address"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Address"
                        fullWidth
                        multiline
                        rows={2}
                        error={!!profileErrors.address}
                        helperText={profileErrors.address?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                <Home fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => {
                        resetProfile({
                          firstName: profile.firstName,
                          lastName: profile.lastName,
                          email: profile.email,
                          phone: profile.phone,
                          dateOfBirth: profile.dateOfBirth?.split('T')[0] || '',
                          address: profile.address || '',
                        });
                        toast('Changes discarded', { icon: '↩️' });
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={uploadAvatarMutation.isPending || updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ==================== TAB 2: SECURITY ==================== */}
          {tabValue === 1 && (
            <Box component="form" onSubmit={handlePwdSubmit(onPasswordSubmit)}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <strong>Password Requirements:</strong> At least 8 characters, one uppercase letter, and one number.
              </Alert>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="currentPassword"
                    control={pwdControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Current Password"
                        type={showCurrentPwd ? 'text' : 'password'}
                        fullWidth
                        error={!!pwdErrors.currentPassword}
                        helperText={pwdErrors.currentPassword?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowCurrentPwd(!showCurrentPwd)} edge="end">
                                  {showCurrentPwd ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="newPassword"
                    control={pwdControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="New Password"
                        type={showNewPwd ? 'text' : 'password'}
                        fullWidth
                        error={!!pwdErrors.newPassword}
                        helperText={pwdErrors.newPassword?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowNewPwd(!showNewPwd)} edge="end">
                                  {showNewPwd ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="confirmPassword"
                    control={pwdControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Confirm New Password"
                        type={showConfirmPwd ? 'text' : 'password'}
                        fullWidth
                        error={!!pwdErrors.confirmPassword}
                        helperText={pwdErrors.confirmPassword?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirmPwd(!showConfirmPwd)} edge="end">
                                  {showConfirmPwd ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Lock />}
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Change Password'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default ProfilePage;