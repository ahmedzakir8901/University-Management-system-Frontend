// src/pages/Settings/tabs/PermissionsTab.jsx
import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, Button, IconButton, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Checkbox, Chip, Tooltip, Divider, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Lock, Shield, CheckCircle, Cancel } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';   // <-- ADDED: this was missing
import * as yup from 'yup';
import { settingsService } from '../../../services/settingsService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';

const schema = yup.object().shape({
  name: yup.string()
    .required('Name is required')
    .matches(/^[A-Z_]+$/, 'Use UPPERCASE with underscores only (e.g., COURSE_CREATE)'),
  description: yup.string().required('Description is required'),
});

function PermissionsTab() {
  const [openModal, setOpenModal] = useState(false);
  const [editingPerm, setEditingPerm] = useState(null);
  const queryClient = useQueryClient();

  // Fetch permissions
  const { data: permissions = [], isLoading, error } = useQuery({
    queryKey: ['permissions'],
    queryFn: settingsService.getPermissions,
  });

  // Fetch roles
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: settingsService.getRoles,
  });

  // Fetch role-permission mappings
  const { data: rolePermissions = [] } = useQuery({
    queryKey: ['rolePermissions'],
    queryFn: settingsService.getRolePermissions,
  });

  // Form
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  // Mutations
  const savePermMutation = useMutation({
    mutationFn: (data) =>
      editingPerm
        ? settingsService.updatePermission(editingPerm.id, data)
        : settingsService.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success(editingPerm ? 'Permission updated!' : 'Permission added!');
      handleClose();
    },
    onError: (err) => toast.error(err.message || 'Failed to save'),
  });

  const deletePermMutation = useMutation({
    mutationFn: settingsService.deletePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
      toast.success('Permission deleted');
    },
  });

  const grantMutation = useMutation({
    mutationFn: ({ roleId, permissionId }) =>
      settingsService.grantPermission(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: ({ roleId, permissionId }) =>
      settingsService.revokePermission(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
    },
  });

  // Handlers
  const handleAdd = () => {
    setEditingPerm(null);
    reset({ name: '', description: '' });
    setOpenModal(true);
  };

  const handleEdit = (perm) => {
    setEditingPerm(perm);
    reset(perm);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingPerm(null);
  };

  const onSubmit = (data) => savePermMutation.mutate(data);

  const handleDelete = (id) => {
    if (window.confirm('Delete this permission? It will be removed from all roles.')) {
      deletePermMutation.mutate(id);
    }
  };

  // Check if a role has a specific permission
  const hasPermission = (roleId, permissionId) => {
    return rolePermissions.some(
      rp => rp.roleId === roleId && rp.permissionId === permissionId
    );
  };

  const togglePermission = (roleId, permissionId, isGranted) => {
    if (isGranted) {
      revokeMutation.mutate({ roleId, permissionId });
    } else {
      grantMutation.mutate({ roleId, permissionId });
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading permissions.</Alert>;

  return (
    <RoleGate allowedRoles={['ADMIN']}>
      <Grid container spacing={3}>
        {/* ============ LEFT: Permissions Catalog ============ */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock /> Permissions Catalog
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {permissions.length} permission{permissions.length !== 1 ? 's' : ''} defined
                </Typography>
              </Box>
              <RoleGate allowedRoles={['ADMIN']}>
                <Button variant="contained" size="small" startIcon={<Add />} onClick={handleAdd}>
                  Add Permission
                </Button>
              </RoleGate>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((perm) => (
                    <TableRow key={perm.id} hover>
                      <TableCell>
                        <Chip
                          label={perm.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', fontSize: 11 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{perm.description}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <RoleGate allowedRoles={['ADMIN']}>
                          <IconButton size="small" color="secondary" onClick={() => handleEdit(perm)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(perm.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </RoleGate>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* ============ RIGHT: Role × Permission Matrix ============ */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield /> Role × Permission Matrix
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Check a box to grant that permission to the role
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="caption">
                <strong>Tip:</strong> Green checkmarks indicate granted permissions. Changes take effect immediately.
              </Typography>
            </Alert>

            <TableContainer sx={{ maxHeight: 500 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 140 }}>Permission</TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} align="center">
                        <Tooltip title={role.description || role.name}>
                          <Chip
                            label={role.name}
                            size="small"
                            color={
                              role.name === 'ADMIN' ? 'error' :
                              role.name === 'FACULTY' ? 'primary' :
                              role.name === 'STUDENT' ? 'success' : 'secondary'
                            }
                          />
                        </Tooltip>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((perm) => (
                    <TableRow key={perm.id} hover>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 11 }}
                        >
                          {perm.name}
                        </Typography>
                      </TableCell>
                      {roles.map((role) => {
                        const granted = hasPermission(role.id, perm.id);
                        return (
                          <TableCell key={role.id} align="center" padding="checkbox">
                            <Tooltip
                              title={
                                granted
                                  ? `Revoke from ${role.name}`
                                  : `Grant to ${role.name}`
                              }
                            >
                              <Checkbox
                                checked={granted}
                                onChange={() => togglePermission(role.id, perm.id, granted)}
                                color="success"
                                size="small"
                              />
                            </Tooltip>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {rolePermissions.length} total permission{rolePermissions.length !== 1 ? 's' : ''} assigned
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <CheckCircle fontSize="small" color="success" />
                <Typography variant="caption">Granted</Typography>
                <Cancel fontSize="small" color="disabled" />
                <Typography variant="caption">Not granted</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ============ Add / Edit Dialog ============ */}
      <Dialog
        open={openModal}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus
        disableAutoFocus
        disableRestoreFocus
      >
        <DialogTitle>{editingPerm ? 'Edit Permission' : 'Add Permission'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Permission Name"
                  placeholder="e.g., COURSE_CREATE"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message || 'Use UPPERCASE and underscores'}
                  slotProps={{
                    input: { style: { fontFamily: 'monospace' } }
                  }}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  placeholder="e.g., Allows creating new courses"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={savePermMutation.isPending}
          >
            {savePermMutation.isPending ? <CircularProgress size={20} /> : (editingPerm ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </RoleGate>
  );
}

export default PermissionsTab;