import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Grid, Chip, Divider, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Card, CardContent,
  LinearProgress, Avatar, useTheme
} from '@mui/material';
import {
  Person, School, People, Reviews, EventNote,
  Email, Badge, CalendarMonth, Home, Phone, WorkspacePremium, Star
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { facultyService } from '../../services/facultyService';
import StarRating from '../common/StarRating';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function FacultyDetailsModal({ open, onClose, facultyId }) {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const { data: faculty, isLoading, error } = useQuery({
    queryKey: ['faculty', facultyId],
    queryFn: () => facultyService.getFacultyById(facultyId),
    enabled: open && !!facultyId,
  });

  React.useEffect(() => {
    if (!open) setTabValue(0);
  }, [open]);

  const getDesignationColor = (designation) => {
    switch (designation) {
      case 'Professor': return 'error';
      case 'Associate Professor': return 'warning';
      case 'Assistant Professor': return 'info';
      case 'Lecturer': return 'primary';
      default: return 'default';
    }
  };

  const getExamTypeColor = (type) => {
    switch (type) {
      case 'MIDTERM': return 'warning';
      case 'FINAL': return 'error';
      case 'SUPPLEMENTARY': return 'info';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
    >
      {isLoading ? (
        <>
          <DialogTitle>Faculty Details</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          </DialogContent>
        </>
      ) : error ? (
        <>
          <DialogTitle>Faculty Details</DialogTitle>
          <DialogContent>
            <Alert severity="error">Failed to load details</Alert>
          </DialogContent>
        </>
      ) : !faculty ? (
        <>
          <DialogTitle>Faculty Details</DialogTitle>
          <DialogContent>
            <Typography color="textSecondary">No faculty data available.</Typography>
          </DialogContent>
        </>
      ) : (
        <>
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ width: 56, height: 56, bgcolor: 'secondary.main', fontSize: 22, fontWeight: 'bold' }}
              >
                {faculty.firstName?.[0]}{faculty.lastName?.[0]}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {faculty.firstName} {faculty.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {faculty.employeeId} • {faculty.email}
                </Typography>
              </Box>
              <Chip
                label={faculty.designation}
                color={getDesignationColor(faculty.designation)}
                size="small"
              />
              {faculty.status && (
                <Chip
                  label={faculty.status}
                  color={faculty.status === 'ACTIVE' ? 'success' : 'warning'}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </DialogTitle>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<Person />} iconPosition="start" label="Overview" />
              <Tab icon={<School />} iconPosition="start" label="Teaching" />
              <Tab icon={<People />} iconPosition="start" label="Students" />
              <Tab icon={<Reviews />} iconPosition="start" label="Evaluations" />
              <Tab icon={<EventNote />} iconPosition="start" label="Invigilation" />
            </Tabs>
          </Box>

          <DialogContent sx={{ minHeight: 400 }}>
            {/* TAB 1: OVERVIEW */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Badge fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Employee ID:</strong> {faculty.employeeId}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Email:</strong> {faculty.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Phone:</strong> {faculty.phone || 'Not provided'}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <School fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Department:</strong> {faculty.departmentId}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Home fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Office:</strong> {faculty.officeRoom || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Joined:</strong> {faculty.joiningDate}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkspacePremium fontSize="small" /> Qualification
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="body2">
                  {faculty.qualification || 'Not provided'}
                </Typography>
              </Paper>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Specialization
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                  {faculty.specialization || 'Not provided'}
                </Typography>
              </Paper>
            </TabPanel>

            {/* TAB 2: TEACHING */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Sections Taught
              </Typography>
              {(faculty.sections || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>Section</TableCell>
                        <TableCell>Enrollment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faculty.sections.map((s) => {
                        const percent = (s.currentEnrollment / s.maxCapacity) * 100;
                        return (
                          <TableRow key={s.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">{s.courseCode}</Typography>
                              <Typography variant="caption" color="text.secondary">{s.courseTitle}</Typography>
                            </TableCell>
                            <TableCell>Section {s.sectionName}</TableCell>
                            <TableCell sx={{ minWidth: 180 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={percent}
                                  color={percent >= 90 ? 'error' : percent >= 70 ? 'warning' : 'primary'}
                                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="caption">{s.currentEnrollment}/{s.maxCapacity}</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" variant="body2" sx={{ mb: 3 }}>No sections assigned.</Typography>
              )}

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Weekly Timetable
              </Typography>
              {(faculty.timetable || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Room</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faculty.timetable.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>
                            <Chip label={slot.day} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                          <TableCell>
                            <strong>{slot.courseCode}</strong> - Sec {slot.sectionName}
                          </TableCell>
                          <TableCell>Room {slot.room}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" variant="body2">No timetable available.</Typography>
              )}
            </TabPanel>

            {/* TAB 3: STUDENTS */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Students in My Sections
              </Typography>
              {(faculty.students || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll Number</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Section</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faculty.students.map((s) => (
                        <TableRow key={`${s.id}-${s.courseCode}`} hover>
                          <TableCell><strong>{s.rollNumber}</strong></TableCell>
                          <TableCell>{s.firstName} {s.lastName}</TableCell>
                          <TableCell>{s.courseCode}</TableCell>
                          <TableCell>Section {s.sectionName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" variant="body2">No students enrolled in your sections.</Typography>
              )}
            </TabPanel>

            {/* TAB 4: EVALUATIONS */}
            <TabPanel value={tabValue} index={3}>
              {faculty.evaluations && faculty.evaluations.totalSubmissions > 0 ? (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Teaching Quality</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Star sx={{ color: '#FFB400' }} fontSize="small" />
                            <Typography variant="h5" fontWeight="bold">{faculty.evaluations.avgTeaching}</Typography>
                          </Box>
                          <StarRating value={Number(faculty.evaluations.avgTeaching)} readOnly size="small" />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Course Content</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Star sx={{ color: '#FFB400' }} fontSize="small" />
                            <Typography variant="h5" fontWeight="bold">{faculty.evaluations.avgContent}</Typography>
                          </Box>
                          <StarRating value={Number(faculty.evaluations.avgContent)} readOnly size="small" />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Overall Rating</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Star sx={{ color: '#FFB400' }} fontSize="small" />
                            <Typography variant="h5" fontWeight="bold">{faculty.evaluations.avgOverall}</Typography>
                          </Box>
                          <StarRating value={Number(faculty.evaluations.avgOverall)} readOnly size="small" />
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Total Reviews</Typography>
                          <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                            {faculty.evaluations.totalSubmissions}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Recent Feedback
                  </Typography>
                  {(faculty.evaluations.recent || []).length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Course</TableCell>
                            <TableCell>Ratings</TableCell>
                            <TableCell>Comments</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {faculty.evaluations.recent.map((e) => (
                            <TableRow key={e.id}>
                              <TableCell><strong>{e.studentName}</strong></TableCell>
                              <TableCell>{e.courseCode}</TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  <Typography variant="caption">Teaching: {e.ratingTeaching}/5</Typography>
                                  <Typography variant="caption">Content: {e.ratingContent}/5</Typography>
                                  <Typography variant="caption">Overall: {e.ratingOverall}/5</Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ maxWidth: 280 }}>
                                <Typography variant="body2">{e.comments || '-'}</Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="textSecondary" variant="body2">No recent feedback.</Typography>
                  )}
                </>
              ) : (
                <Typography color="textSecondary" variant="body2">No evaluations received yet.</Typography>
              )}
            </TabPanel>

            {/* TAB 5: INVIGILATION */}
            <TabPanel value={tabValue} index={4}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Exam Invigilation Duties
              </Typography>
              {(faculty.invigilations || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Course</TableCell>
                        <TableCell>Exam Type</TableCell>
                        <TableCell>Room</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {faculty.invigilations.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell>{inv.examDate}</TableCell>
                          <TableCell>{inv.startTime} - {inv.endTime}</TableCell>
                          <TableCell><strong>{inv.courseCode}</strong></TableCell>
                          <TableCell>
                            <Chip label={inv.examType} size="small" color={getExamTypeColor(inv.examType)} />
                          </TableCell>
                          <TableCell>Room {inv.room}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" variant="body2">No invigilation duties assigned.</Typography>
              )}
            </TabPanel>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export default FacultyDetailsModal;