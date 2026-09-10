import React, { useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Chip, IconButton, Collapse, Grid, Card, CardContent, Button, Tooltip
} from '@mui/material';
import {
  Search, ExpandMore, ExpandLess, Login, Delete, Edit, Add, Person,
  SystemUpdateAlt, Campaign, Security, Warning
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../../services/auditService';
import RoleGate from '../../components/RoleGate';

function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: auditService.getAuditLogs,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-lookup'],
    queryFn: auditService.getUsers,
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading audit logs.</Alert>;

  const getUserLabel = (userId) => {
    const u = users.find(u => u.id === userId);
    return u ? `${u.firstName} ${u.lastName}` : 'Unknown User';
  };

  const getActionIcon = (action) => {
    if (action.startsWith('LOGIN_SUCCESS')) return <Login color="success" fontSize="small" />;
    if (action.startsWith('LOGIN_FAILED')) return <Warning color="error" fontSize="small" />;
    if (action.startsWith('CREATE')) return <Add color="primary" fontSize="small" />;
    if (action.startsWith('UPDATE')) return <Edit color="warning" fontSize="small" />;
    if (action.startsWith('DELETE')) return <Delete color="error" fontSize="small" />;
    if (action.startsWith('PUBLISH')) return <Campaign color="info" fontSize="small" />;
    if (action.startsWith('ROLE_CHANGE')) return <Person color="secondary" fontSize="small" />;
    if (action.startsWith('SYSTEM')) return <SystemUpdateAlt color="action" fontSize="small" />;
    return <Security fontSize="small" />;
  };

  const getActionColor = (action) => {
    if (action.startsWith('LOGIN_SUCCESS')) return 'success';
    if (action.startsWith('LOGIN_FAILED')) return 'error';
    if (action.startsWith('CREATE')) return 'primary';
    if (action.startsWith('UPDATE')) return 'warning';
    if (action.startsWith('DELETE')) return 'error';
    if (action.startsWith('PUBLISH')) return 'info';
    if (action.startsWith('ROLE_CHANGE')) return 'secondary';
    return 'default';
  };

  // Get unique list of action types for the filter dropdown
  const uniqueActions = [...new Set((logs || []).map(l => l.action))].sort();

  const filtered = (logs || []).filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
    const matchesUser = !filterUser || log.userId === Number(filterUser);
    const matchesAction = !filterAction || log.action === filterAction;
    const matchesDateFrom = !dateFrom || new Date(log.timestamp) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(log.timestamp) <= new Date(dateTo + 'T23:59:59');
    return matchesSearch && matchesUser && matchesAction && matchesDateFrom && matchesDateTo;
  });

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterUser('');
    setFilterAction('');
    setDateFrom('');
    setDateTo('');
  };

  // Stats
  const stats = {
    total: logs?.length || 0,
    failedLogins: logs?.filter(l => l.action === 'LOGIN_FAILED').length || 0,
    deletions: logs?.filter(l => l.action.startsWith('DELETE')).length || 0,
    today: logs?.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length || 0,
  };

  return (
    <RoleGate allowedRoles={['ADMIN']}>
      <Box>
        <Typography variant="h4" gutterBottom>Audit Logs</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Track all system activity for security and accountability.
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="caption" color="textSecondary">Total Logs</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="caption" color="textSecondary">Today's Activity</Typography>
                <Typography variant="h5" fontWeight="bold">{stats.today}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="caption" color="textSecondary">Failed Logins</Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">{stats.failedLogins}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="caption" color="textSecondary">Deletions</Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">{stats.deletions}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth size="small" placeholder="Search details, action, or IP..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>User</InputLabel>
                <Select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} label="User">
                  <MenuItem value="">All Users</MenuItem>
                  {users.map(u => (
                    <MenuItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} label="Action">
                  <MenuItem value="">All Actions</MenuItem>
                  {uniqueActions.map(action => (
                    <MenuItem key={action} value={action}>{action.replace(/_/g, ' ')}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button fullWidth variant="outlined" onClick={clearFilters}>Clear Filters</Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="From Date" type="date"
                value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small" label="To Date" type="date"
                value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Results count */}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          Showing {filtered.length} of {logs.length} logs
        </Typography>

        {/* Logs Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="40"></TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow hover>
                    <TableCell>
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => toggleRow(log.id)}>
                          {expandedRow === log.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{getUserLabel(log.userId)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getActionIcon(log.action)}
                        label={log.action.replace(/_/g, ' ')}
                        color={getActionColor(log.action)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {log.ipAddress}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap title={log.details}>
                        {log.details}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedRow === log.id ? undefined : 'none' }}>
                      <Collapse in={expandedRow === log.id} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" gutterBottom>Full Details</Typography>
                          <Typography variant="body2">{log.details}</Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                            <strong>Log ID:</strong> {log.id} &nbsp;|&nbsp;
                            <strong>User ID:</strong> {log.userId} &nbsp;|&nbsp;
                            <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </RoleGate>
  );
}

export default AuditLogsPage;