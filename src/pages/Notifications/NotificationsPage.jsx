import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button, IconButton, Chip, CircularProgress, Alert, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider } from '@mui/material';
import { Add, Delete, NotificationsActive, Campaign } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import AnnouncementFormModal from '../../components/notifications/AnnouncementFormModal';
import RoleGate from '../../components/RoleGate';
import { formatDate } from '../../utils/formatDate';

function NotificationsPage() {
  const [openModal, setOpenModal] = useState(false);

  // Fetch Announcements
  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: notificationService.getAnnouncements,
  });

  // Fetch Notifications
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteAnnouncement,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading data.</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Notifications & Announcements</Typography>
        <RoleGate allowedRoles={['ADMIN', 'FACULTY', 'LIBRARIAN']}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)}>Post Announcement</Button>
        </RoleGate>
      </Box>

      <Grid container spacing={3}>
        {/* Announcements Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Campaign sx={{ mr: 1 }} /> Announcements
            </Typography>
            {announcements.map((announcement) => (
              <Card key={announcement.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{announcement.title}</Typography>
                    <Chip label={announcement.targetRole} size="small" color={announcement.targetRole === 'ALL' ? 'primary' : 'secondary'} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {announcement.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    By {announcement.createdBy} on {formatDate(announcement.createdAt)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <RoleGate allowedRoles={['ADMIN']}>
                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(announcement.id)}>
                      <Delete />
                    </IconButton>
                  </RoleGate>
                </CardActions>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Notifications Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsActive sx={{ mr: 1 }} /> My Notifications
            </Typography>
            <List>
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: notification.isRead ? 'grey.300' : 'primary.main' }}>
                        <NotificationsActive />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {notification.message}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {` — ${formatDate(notification.createdAt)}`}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <AnnouncementFormModal open={openModal} onClose={() => setOpenModal(false)} />
    </Box>
  );
}

export default NotificationsPage;