import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Grid, Chip, Divider, CircularProgress, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Card, CardContent,
  LinearProgress, Avatar, useTheme
} from '@mui/material';
import {
  Person, School, EventAvailable, Grade, AccountBalance,
  Email, Badge, CalendarMonth, Home, Phone, History, FileDownload
} from '@mui/icons-material'; // <-- Added History + FileDownload
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { exportToPDF } from '../../utils/exportUtils'; // <-- NEW

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function StudentDetailsModal({ open, onClose, studentId }) {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const { data: student, isLoading, error } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getStudentById(studentId),
    enabled: open && !!studentId,
  });

  React.useEffect(() => {
    if (!open) setTabValue(0);
  }, [open]);

  // ==================== HELPERS ====================
  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'UNPAID': return 'error';
      case 'PARTIALLY_PAID': return 'warning';
      case 'OVERDUE': return 'default';
      default: return 'default';
    }
  };

  const getItemTypeColor = (type) => {
    switch (type) {
      case 'ASSIGNMENT': return 'primary';
      case 'QUIZ': return 'info';
      case 'MIDTERM': return 'warning';
      case 'FINAL_EXAM': return 'error';
      case 'PROJECT': return 'secondary';
      default: return 'default';
    }
  };

  const getAttendanceColor = (pct) => {
    if (pct >= 90) return 'success';
    if (pct >= 75) return 'primary';
    if (pct >= 60) return 'warning';
    return 'error';
  };

  const getGradeChipColor = (letter) => {
    if (letter.startsWith('A')) return 'success';
    if (letter.startsWith('B')) return 'primary';
    if (letter.startsWith('C')) return 'warning';
    if (letter.startsWith('D')) return 'warning';
    return 'error';
  };

  const getGpaColor = (gpa) => {
    const g = Number(gpa);
    if (g >= 3.5) return 'success';
    if (g >= 3.0) return 'primary';
    if (g >= 2.0) return 'warning';
    return 'error';
  };

  // ==================== DOWNLOAD TRANSCRIPT ====================
  const handleDownloadTranscript = () => {
    if (!student?.semesterGrades?.length) return;

    const rows = [];
    student.semesterGrades.forEach((sem) => {
      sem.courses.forEach((c) => {
        rows.push([
          `Sem ${sem.semester} - ${sem.termName}`,
          c.code,
          c.title,
          c.credits,
          c.letterGrade,
          c.gradePoint.toFixed(2),
          (c.gradePoint * c.credits).toFixed(2),
        ]);
      });
    });

    exportToPDF({
      title: `Official Transcript — ${student.firstName} ${student.lastName} (${student.rollNumber})`,
      columns: ['Semester', 'Course Code', 'Title', 'Credits', 'Grade', 'Grade Point', 'Quality Points'],
      rows,
      fileName: `transcript_${student.rollNumber}`,
    });
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
          <DialogTitle>Student Details</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          </DialogContent>
        </>
      ) : error ? (
        <>
          <DialogTitle>Student Details</DialogTitle>
          <DialogContent>
            <Alert severity="error">Failed to load details</Alert>
          </DialogContent>
        </>
      ) : !student ? (
        <>
          <DialogTitle>Student Details</DialogTitle>
          <DialogContent>
            <Typography color="textSecondary">No student data available.</Typography>
          </DialogContent>
        </>
      ) : (
        <>
          {/* ===== Header ===== */}
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22, fontWeight: 'bold' }}
              >
                {student.firstName?.[0]}{student.lastName?.[0]}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {student.firstName} {student.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {student.rollNumber} • {student.email}
                </Typography>
              </Box>
              <Chip
                label={student.academicStatus}
                color={student.academicStatus === 'ACTIVE' ? 'success' : 'warning'}
              />
            </Box>
          </DialogTitle>

          {/* ===== Tabs ===== */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<Person />} iconPosition="start" label="Overview" />
              <Tab icon={<School />} iconPosition="start" label="Academics" />
              <Tab icon={<EventAvailable />} iconPosition="start" label="Attendance" />
              <Tab icon={<Grade />} iconPosition="start" label="Grades" />
              <Tab icon={<History />} iconPosition="start" label="Academic Record" /> {/* NEW */}
              <Tab icon={<AccountBalance />} iconPosition="start" label="Finance" />
            </Tabs>
          </Box>

          <DialogContent sx={{ minHeight: 400 }}>
            {/* ============ TAB 1: OVERVIEW ============ */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Badge fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Roll Number:</strong> {student.rollNumber}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Email:</strong> {student.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2"><strong>Semester:</strong> {student.currentSemester}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2"><strong>CGPA:</strong> {student.cgpa}</Typography>
                  </Box>
                  {student.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2"><strong>Phone:</strong> {student.phone}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2"><strong>Department ID:</strong> {student.departmentId}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Home fontSize="small" /> Emergency Contacts
              </Typography>
              {(student.emergencyContacts || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Relationship</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Address</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {student.emergencyContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>{contact.contactName}</TableCell>
                          <TableCell>{contact.relationship}</TableCell>
                          <TableCell>{contact.phoneNumber}</TableCell>
                          <TableCell>{contact.address}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" variant="body2">No emergency contacts on file.</Typography>
              )}
            </TabPanel>

            {/* ============ TAB 2: ACADEMICS ============ */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Enrolled Courses</Typography>
              {(student.enrolledCourses || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Course Code</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell align="right">Credits</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {student.enrolledCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell><strong>{course.code}</strong></TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell align="right">{course.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" variant="body2" sx={{ mb: 3 }}>No courses enrolled.</Typography>
              )}

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>Weekly Timetable</Typography>
              {(student.timetable || []).length > 0 ? (
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
                      {student.timetable.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell><Chip label={slot.day} size="small" color="primary" variant="outlined" /></TableCell>
                          <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                          <TableCell><strong>{slot.courseCode}</strong></TableCell>
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

            {/* ============ TAB 3: ATTENDANCE ============ */}
            <TabPanel value={tabValue} index={2}>
              {(student.attendanceSummary || []).length > 0 ? (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Total Classes</Typography>
                          <Typography variant="h5" fontWeight="bold">
                            {student.attendanceSummary.reduce((sum, a) => sum + a.total, 0)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Classes Attended</Typography>
                          <Typography variant="h5" fontWeight="bold" color="success.main">
                            {student.attendanceSummary.reduce((sum, a) => sum + a.attended, 0)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Overall Attendance</Typography>
                          <Typography variant="h5" fontWeight="bold" color="primary.main">
                            {((student.attendanceSummary.reduce((sum, a) => sum + a.attended, 0) /
                              student.attendanceSummary.reduce((sum, a) => sum + a.total, 0)) * 100).toFixed(1)}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Per-Course Breakdown</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Course</TableCell>
                          <TableCell>Attended</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Attendance Rate</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {student.attendanceSummary.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell><strong>{a.courseCode}</strong></TableCell>
                            <TableCell>{a.attended} / {a.total}</TableCell>
                            <TableCell>
                              <LinearProgress
                                variant="determinate"
                                value={a.percentage}
                                color={getAttendanceColor(a.percentage)}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={`${a.percentage}%`} size="small" color={getAttendanceColor(a.percentage)} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography color="textSecondary" variant="body2">No attendance records available.</Typography>
              )}
            </TabPanel>

            {/* ============ TAB 4: GRADES ============ */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Final Course Grades</Typography>
              {(student.finalGrades || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>Letter Grade</TableCell>
                        <TableCell>Grade Point</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {student.finalGrades.map((fg) => (
                        <TableRow key={fg.id}>
                          <TableCell><strong>{fg.courseCode}</strong></TableCell>
                          <TableCell>
                            <Chip label={fg.letterGrade} color={getGradeChipColor(fg.letterGrade)} size="small" />
                          </TableCell>
                          <TableCell>{fg.gradePoint.toFixed(2)}</TableCell>
                          <TableCell>
                            {fg.isPublished
                              ? <Chip label="Published" size="small" color="success" variant="outlined" />
                              : <Chip label="Pending" size="small" variant="outlined" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" variant="body2" sx={{ mb: 3 }}>No final grades published yet.</Typography>
              )}

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Individual Assessments</Typography>
              {(student.grades || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Marks</TableCell>
                        <TableCell>Weightage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {student.grades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell><strong>{grade.courseCode}</strong></TableCell>
                          <TableCell>
                            <Chip label={grade.itemType.replace('_', ' ')} size="small" color={getItemTypeColor(grade.itemType)} />
                          </TableCell>
                          <TableCell>{grade.marksObtained} / {grade.maxMarks}</TableCell>
                          <TableCell>{grade.weightage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" variant="body2">No grades recorded.</Typography>
              )}
            </TabPanel>

            {/* ============ TAB 5: ACADEMIC RECORD (Transcript View) ============ */}
            <TabPanel value={tabValue} index={4}>
              {(student.semesterGrades || []).length > 0 ? (
                <>
                  {/* Download Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownload />}
                      onClick={handleDownloadTranscript}
                      size="small"
                    >
                      Download Transcript
                    </Button>
                  </Box>

                  {/* Summary Cards */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Cumulative CGPA</Typography>
                          <Typography variant="h4" fontWeight="bold" color="primary.main">
                            {(
                              student.semesterGrades.reduce((sum, s) => {
                                const weightedSum = s.courses.reduce((gs, c) => gs + c.gradePoint * c.credits, 0);
                                return sum + weightedSum;
                              }, 0) /
                              student.semesterGrades.reduce((sum, s) =>
                                sum + s.courses.reduce((cs, c) => cs + c.credits, 0), 0
                              )
                            ).toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Total Credits</Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {student.semesterGrades.reduce((sum, s) =>
                              sum + s.courses.reduce((cs, c) => cs + c.credits, 0), 0
                            )}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Semesters</Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {student.semesterGrades.length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">Courses Completed</Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {student.semesterGrades.reduce((sum, s) => sum + s.courses.length, 0)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Transcript Table */}
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Official Transcript
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell>#</TableCell>
                          <TableCell>Semester</TableCell>
                          <TableCell>Course Code</TableCell>
                          <TableCell>Course Title</TableCell>
                          <TableCell align="center">Credits</TableCell>
                          <TableCell align="center">Letter Grade</TableCell>
                          <TableCell align="center">Grade Point</TableCell>
                          <TableCell align="center">Quality Points</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(() => {
                          let courseCounter = 0;
                          let runningCredits = 0;
                          let runningQualityPoints = 0;

                          return student.semesterGrades.flatMap((sem, semIdx) => {
                            const rows = [];

                            // Semester header row
                            rows.push(
                              <TableRow key={`sem-header-${semIdx}`} sx={{ bgcolor: 'primary.main' }}>
                                <TableCell colSpan={8} sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>
                                  Semester {sem.semester} — {sem.termName}
                                </TableCell>
                              </TableRow>
                            );

                            // Course rows
                            sem.courses.forEach((course) => {
                              courseCounter += 1;
                              const qualityPoints = course.gradePoint * course.credits;
                              runningCredits += course.credits;
                              runningQualityPoints += qualityPoints;

                              rows.push(
                                <TableRow key={`${semIdx}-${course.code}`} hover>
                                  <TableCell>{courseCounter}</TableCell>
                                  <TableCell>{sem.semester}</TableCell>
                                  <TableCell><strong>{course.code}</strong></TableCell>
                                  <TableCell>{course.title}</TableCell>
                                  <TableCell align="center">{course.credits}</TableCell>
                                  <TableCell align="center">
                                    <Chip label={course.letterGrade} size="small" color={getGradeChipColor(course.letterGrade)} />
                                  </TableCell>
                                  <TableCell align="center">{course.gradePoint.toFixed(2)}</TableCell>
                                  <TableCell align="center">{qualityPoints.toFixed(2)}</TableCell>
                                </TableRow>
                              );
                            });

                            // Semester summary row
                            const semCredits = sem.courses.reduce((sum, c) => sum + c.credits, 0);
                            const semQualityPoints = sem.courses.reduce((sum, c) => sum + c.gradePoint * c.credits, 0);
                            const semGpa = semCredits > 0 ? (semQualityPoints / semCredits).toFixed(2) : '0.00';
                            const runningCgpa = runningCredits > 0 ? (runningQualityPoints / runningCredits).toFixed(2) : '0.00';

                            rows.push(
                              <TableRow key={`sem-summary-${semIdx}`} sx={{ bgcolor: 'success.light' }}>
                                <TableCell colSpan={4} align="right">
                                  <strong>Semester {sem.semester} GPA:</strong>
                                </TableCell>
                                <TableCell align="center"><strong>{semCredits}</strong></TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={`GPA: ${semGpa}`}
                                    color={getGpaColor(semGpa)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="center"><strong>{semQualityPoints.toFixed(2)}</strong></TableCell>
                                <TableCell align="center">
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    Running CGPA
                                  </Typography>
                                  <Chip label={runningCgpa} size="small" color="primary" variant="outlined" />
                                </TableCell>
                              </TableRow>
                            );

                            return rows;
                          });
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Final CGPA Hero Card */}
                  <Paper
                    sx={{
                      mt: 3,
                      p: 3,
                      background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                      color: 'white',
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h6" fontWeight="bold">
                          🎓 Final Cumulative Grade Point Average (CGPA)
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Calculated across all {student.semesterGrades.reduce((sum, s) => sum + s.courses.length, 0)} courses
                          from {student.semesterGrades.length} semesters
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                          <Typography variant="h2" fontWeight="bold">
                            {(
                              student.semesterGrades.reduce((sum, s) => {
                                const weightedSum = s.courses.reduce((gs, c) => gs + c.gradePoint * c.credits, 0);
                                return sum + weightedSum;
                              }, 0) /
                              student.semesterGrades.reduce((sum, s) =>
                                sum + s.courses.reduce((cs, c) => cs + c.credits, 0), 0
                              )
                            ).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>out of 4.00</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </>
              ) : (
                <Typography color="textSecondary" variant="body2">
                  No academic history available yet.
                </Typography>
              )}
            </TabPanel>

            {/* ============ TAB 6: FINANCE ============ */}
            <TabPanel value={tabValue} index={5}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">Total Billed</Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {formatCurrency(student.feeStatus?.totalBilled || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">Total Paid</Typography>
                      <Typography variant="h5" fontWeight="bold" color="success.main">
                        {formatCurrency(student.feeStatus?.totalPaid || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">Balance Due</Typography>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={(student.feeStatus?.balance || 0) > 0 ? 'error.main' : 'success.main'}
                      >
                        {formatCurrency(student.feeStatus?.balance || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Invoice History</Typography>
              {(student.feeStatus?.invoices || []).length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {student.feeStatus.invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell><strong>{inv.invoiceNumber}</strong></TableCell>
                          <TableCell>{formatCurrency(inv.amount)}</TableCell>
                          <TableCell>{formatDate(inv.dueDate)}</TableCell>
                          <TableCell>
                            <Chip label={inv.status.replace('_', ' ')} color={getStatusColor(inv.status)} size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary" variant="body2">No invoices on record.</Typography>
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

export default StudentDetailsModal;