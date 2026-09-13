import React from 'react';
import {
  Box, Typography, Card, CardContent, Grid, CircularProgress, Alert,
  Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, Chip, useTheme
} from '@mui/material';
import {
  People, School, MenuBook, AccountBalance, TrendingUp, AttachMoney, Event,
  ArrowUpward, ArrowDownward
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';

function Dashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Theme-aware chart colors
  const chartColors = {
    grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    axis: isDark ? '#94a3b8' : '#5f6c7b',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    tooltipText: isDark ? '#f1f5f9' : '#1a2027',
    primary: isDark ? '#90caf9' : '#1976d2',
    secondary: isDark ? '#ce93d8' : '#9c27b0',
    success: isDark ? '#66bb6a' : '#388e3c',
  };

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading dashboard data: {error.message}</Alert>;
  }

  const { stats, studentDistribution, enrollmentTrend, recentActivities } = dashboardData;

  // Stat Cards Configuration
  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: <People />, color: '#1976d2', trend: '+12%' },
    { title: 'Total Faculty', value: stats.totalFaculty, icon: <School />, color: '#388e3c', trend: '+3%' },
    { title: 'Total Courses', value: stats.totalCourses, icon: <MenuBook />, color: '#f57c00', trend: '+5%' },
    { title: 'Departments', value: stats.totalDepartments, icon: <AccountBalance />, color: '#7b1fa2', trend: '0%' },
    { title: 'Attendance Rate', value: `${stats.attendanceRate}%`, icon: <Event />, color: '#0288d1', trend: '+2.5%' },
    { title: 'Fee Collection', value: `${stats.feeCollectionRate}%`, icon: <AttachMoney />, color: '#c62828', trend: '+8.3%' },
  ];

  // Custom tooltip that respects dark mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: chartColors.tooltipBg,
            border: `1px solid ${chartColors.tooltipBorder}`,
            borderRadius: 1,
            p: 1.5,
            boxShadow: 3,
          }}
        >
          <Typography variant="body2" fontWeight="bold" color={chartColors.tooltipText}>
            {label}
          </Typography>
          {payload.map((entry, idx) => (
            <Typography key={idx} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: <strong>{entry.value}</strong>
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening at your university.
        </Typography>
      </Box>

      {/* Stat Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={card.title}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderColor: card.color,
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" fontWeight="bold">
                      {card.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
                  {card.trend.startsWith('+') ? (
                    <ArrowUpward sx={{ fontSize: 14, color: 'success.main' }} />
                  ) : card.trend.startsWith('-') ? (
                    <ArrowDownward sx={{ fontSize: 14, color: 'error.main' }} />
                  ) : null}
                  <Typography
                    variant="caption"
                    sx={{
                      color: card.trend.startsWith('+') ? 'success.main' :
                             card.trend.startsWith('-') ? 'error.main' : 'text.secondary',
                      fontWeight: 600,
                    }}
                  >
                    {card.trend}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    vs last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Pie Chart: Students by Department */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Students by Department
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Distribution across all departments
              </Typography>
              <Box sx={{ height: 320, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentDistribution}
                      dataKey="students"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {studentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke={theme.palette.background.paper} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar Chart: Monthly Enrollments */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Monthly Enrollments
              </Typography>
              <Typography variant="caption" color="text.secondary">
                New student enrollments per month
              </Typography>
              <Box sx={{ height: 320, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke={chartColors.axis}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: chartColors.grid }}
                    />
                    <YAxis
                      stroke={chartColors.axis}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: chartColors.grid }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(144, 202, 249, 0.1)' }} />
                    <Bar
                      dataKey="enrollments"
                      name="Enrollments"
                      fill={chartColors.primary}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Line Chart: Enrollment Trend */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Enrollment Trend
              </Typography>
              <Typography variant="caption" color="text.secondary">
                12-month growth pattern
              </Typography>
              <Box sx={{ height: 320, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentTrend}>
                    <defs>
                      <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.6} />
                        <stop offset="95%" stopColor={chartColors.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke={chartColors.axis}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: chartColors.grid }}
                    />
                    <YAxis
                      stroke={chartColors.axis}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: chartColors.grid }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="enrollments"
                      name="Enrollments"
                      stroke={chartColors.success}
                      strokeWidth={3}
                      fill="url(#colorEnrollments)"
                      dot={{ r: 4, fill: chartColors.success, strokeWidth: 2, stroke: theme.palette.background.paper }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Recent Activities
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Latest system events
                  </Typography>
                </Box>
                <Chip
                  label={`${recentActivities.length} new`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Divider sx={{ mb: 1 }} />
              <List>
                {recentActivities.map((activity, idx) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: chartColors.primary }}>
                          <TrendingUp />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="600">
                            {activity.action}
                          </Typography>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                            <Typography component="span" variant="caption" color="text.secondary">
                              {activity.user}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary">
                              {new Date(activity.timestamp).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {idx < recentActivities.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;