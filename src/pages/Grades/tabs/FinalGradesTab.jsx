// src/pages/Grades/tabs/FinalGradesTab.jsx
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Button, IconButton, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tooltip
} from '@mui/material';
import {
  Calculate, Edit, Delete, Publish, UnpublishedOutlined, Info
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeService } from '../../../services/gradeService';
import { toast } from 'react-hot-toast';
import RoleGate from '../../../components/RoleGate';
import ExportButton from '../../../components/common/ExportButton';

// Grade scale mapping
const GRADE_SCALE = [
  { min: 90, letter: 'A',  point: 4.00 },
  { min: 85, letter: 'B+', point: 3.50 },
  { min: 80, letter: 'B',  point: 3.00 },
  { min: 75, letter: 'C+', point: 2.50 },
  { min: 70, letter: 'C',  point: 2.00 },
  { min: 60, letter: 'D',  point: 1.00 },
  { min: 0,  letter: 'F',  point: 0.00 },
];

const scoreToGrade = (score) => {
  if (score === null || score === undefined) return { letter: '-', point: 0 };
  const tier = GRADE_SCALE.find(g => score >= g.min);
  return tier || GRADE_SCALE[GRADE_SCALE.length - 1];
};

const LETTERS = ['A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
const LETTER_TO_POINT = {
  'A': 4.00, 'B+': 3.50, 'B': 3.00, 'C+': 2.50, 'C': 2.00, 'D': 1.00, 'F': 0.00,
};

function FinalGradesTab() {
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [editingGrade, setEditingGrade] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [overrideLetter, setOverrideLetter] = useState('');

  const queryClient = useQueryClient();

  // Fetch all reference data
  const { data: sections = [] } = useQuery({ queryKey: ['sections'], queryFn: gradeService.getSections });
  const { data: courses = [] } = useQuery({ queryKey: ['courses-lookup'], queryFn: gradeService.getCourses });
  const { data: students = [] } = useQuery({ queryKey: ['students-lookup'], queryFn: gradeService.getStudents });
  const { data: enrollments = [] } = useQuery({ queryKey: ['enrollments-lookup'], queryFn: gradeService.getEnrollments });
  const { data: gradeItems = [] } = useQuery({ queryKey: ['gradeItems'], queryFn: gradeService.getGradeItems });
  const { data: studentGrades = [] } = useQuery({ queryKey: ['studentGrades'], queryFn: gradeService.getStudentGrades });
  const { data: finalGrades = [], isLoading, error } = useQuery({
    queryKey: ['finalGrades'],
    queryFn: gradeService.getAllFinalGrades,
  });

  // Lookup helpers
  const getStudentLabel = (id) => {
    const s = students.find(s => s.id === id);
    return s ? `${s.rollNumber} - ${s.firstName} ${s.lastName}` : 'Unknown';
  };

  const getSectionLabel = (id) => {
    const s = sections.find(s => s.id === id);
    if (!s) return 'Unknown';
    const c = courses.find(c => c.id === s.courseId);
    return `${c?.code || 'N/A'} - Section ${s.sectionName}`;
  };

  /**
   * Compute final score for an enrollment:
   * For each grade_item in the section, take student's marks and apply weightage.
   */
  const computeFinalScore = (enrollment) => {
    const sectionItems = gradeItems.filter(gi => gi.sectionId === enrollment.sectionId);
    if (sectionItems.length === 0) return null;

    let totalWeightedScore = 0;
    let totalWeightage = 0;

    sectionItems.forEach(item => {
      const sg = studentGrades.find(
        g => g.gradeItemId === item.id && g.studentId === enrollment.studentId
      );
      if (sg) {
        const pct = (sg.marksObtained / item.maxMarks) * 100;
        totalWeightedScore += (pct * item.weightagePercent) / 100;
        totalWeightage += item.weightagePercent;
      }
    });

    // Scale to 100 if not all weightage covered
    if (totalWeightage === 0) return null;
    return Number(((totalWeightedScore / totalWeightage) * 100).toFixed(2));
  };

  // Get enrollments for the selected section
  const sectionEnrollments = useMemo(() => {
    if (!selectedSectionId) return [];
    return enrollments.filter(
      e => e.sectionId === Number(selectedSectionId) && e.enrollmentStatus === 'ENROLLED'
    );
  }, [enrollments, selectedSectionId]);

  // Combine enrollment + computed score + existing final grade
  const rows = useMemo(() => {
    return sectionEnrollments.map(enrollment => {
      const existingFG = finalGrades.find(fg => fg.enrollmentId === enrollment.id);
      const computedScore = existingFG ? existingFG.totalScore : computeFinalScore(enrollment);
      const autoGrade = scoreToGrade(computedScore);
      return {
        enrollment,
        student: students.find(s => s.id === enrollment.studentId),
        existingFG,
        computedScore,
        autoLetter: autoGrade.letter,
        autoPoint: autoGrade.point,
      };
    });
  }, [sectionEnrollments, finalGrades, studentGrades, gradeItems, students]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async ({ enrollment, existingFG, letter }) => {
      const point = LETTER_TO_POINT[letter] ?? 0;
      const score = existingFG?.totalScore ?? computeFinalScore(enrollment);
      if (existingFG) {
        return gradeService.updateFinalGrade(existingFG.id, {
          totalScore: score,
          letterGrade: letter,
          gradePoint: point,
        });
      }
      return gradeService.createFinalGrade({
        enrollmentId: enrollment.id,
        totalScore: score,
        letterGrade: letter,
        gradePoint: point,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalGrades'] });
      toast.success('Final grade saved');
      handleClose();
    },
    onError: (err) => toast.error(err.message || 'Failed to save'),
  });

  const publishMutation = useMutation({
    mutationFn: gradeService.publishFinalGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalGrades'] });
      toast.success('Grade published — students can now see it');
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: gradeService.unpublishFinalGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalGrades'] });
      toast.success('Grade unpublished');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: gradeService.deleteFinalGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalGrades'] });
      toast.success('Final grade deleted');
    },
  });

  // Handlers
  const handleOpenEdit = (row) => {
    setEditingGrade(row);
    setOverrideLetter(row.existingFG?.letterGrade || row.autoLetter);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingGrade(null);
    setOverrideLetter('');
  };

  const handleSave = () => {
    if (!editingGrade) return;
    saveMutation.mutate({
      enrollment: editingGrade.enrollment,
      existingFG: editingGrade.existingFG,
      letter: overrideLetter,
    });
  };

  const handlePublish = (row) => {
    if (!row.existingFG) {
      toast.error('Save the grade first before publishing');
      return;
    }
    publishMutation.mutate(row.existingFG.id);
  };

  const handleUnpublish = (row) => {
    unpublishMutation.mutate(row.existingFG.id);
  };

  const handleDelete = (row) => {
    if (window.confirm('Delete this final grade? This will not affect the individual grade items.')) {
      deleteMutation.mutate(row.existingFG.id);
    }
  };

  // Export rows
  const exportRows = rows.map(row => [
    getStudentLabel(row.enrollment.studentId),
    row.computedScore !== null ? row.computedScore.toFixed(2) : '-',
    row.existingFG?.letterGrade || row.autoLetter,
    row.existingFG?.gradePoint?.toFixed(2) || row.autoPoint.toFixed(2),
    row.existingFG?.isPublished ? 'Published' : 'Unpublished',
  ]);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading final grades.</Alert>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 320 }}>
          <InputLabel>Select Section</InputLabel>
          <Select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            label="Select Section"
          >
            {sections.map(s => (
              <MenuItem key={s.id} value={s.id}>{getSectionLabel(s.id)}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedSectionId && rows.length > 0 && (
          <ExportButton
            title={`Final Grades - ${getSectionLabel(selectedSectionId)}`}
            fileName="final_grades"
            columns={['Student', 'Total Score', 'Letter Grade', 'Grade Point', 'Status']}
            rows={exportRows}
          />
        )}
      </Box>

      {/* Info panel */}
      {!selectedSectionId && (
        <Alert severity="info" icon={<Info />}>
          Select a section to view and compute final grades. The score is calculated automatically from
          weighted grade items. You can override the letter grade before publishing.
        </Alert>
      )}

      {/* Table */}
      {selectedSectionId && (
        <>
          {sectionEnrollments.length === 0 ? (
            <Alert severity="warning">
              No enrolled students in this section yet.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell align="center">Total Score</TableCell>
                    <TableCell align="center">Letter</TableCell>
                    <TableCell align="center">Grade Point</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => {
                    const letter = row.existingFG?.letterGrade || row.autoLetter;
                    const point = row.existingFG?.gradePoint ?? row.autoPoint;
                    const isPublished = row.existingFG?.isPublished;

                    return (
                      <TableRow key={row.enrollment.id} hover>
                        <TableCell>{getStudentLabel(row.enrollment.studentId)}</TableCell>
                        <TableCell align="center">
                          {row.computedScore !== null
                            ? `${row.computedScore.toFixed(2)} / 100`
                            : <Chip label="No data" size="small" variant="outlined" />}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={letter}
                            color={letter === 'F' ? 'error' : letter === 'A' ? 'success' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">{point.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          {row.existingFG ? (
                            isPublished
                              ? <Chip label="Published" color="success" size="small" />
                              : <Chip label="Draft" color="default" size="small" />
                          ) : (
                            <Chip label="Not saved" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <RoleGate allowedRoles={['ADMIN', 'FACULTY']}>
                            <Tooltip title="Compute / Edit">
                              <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
                                <Calculate />
                              </IconButton>
                            </Tooltip>
                            {row.existingFG && !row.existingFG.isPublished && (
                              <Tooltip title="Publish">
                                <IconButton size="small" color="success" onClick={() => handlePublish(row)}>
                                  <Publish />
                                </IconButton>
                              </Tooltip>
                            )}
                            {row.existingFG && row.existingFG.isPublished && (
                              <Tooltip title="Unpublish">
                                <IconButton size="small" color="warning" onClick={() => handleUnpublish(row)}>
                                  <UnpublishedOutlined />
                                </IconButton>
                              </Tooltip>
                            )}
                            {row.existingFG && (
                              <RoleGate allowedRoles={['ADMIN']}>
                                <Tooltip title="Delete">
                                  <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </RoleGate>
                            )}
                          </RoleGate>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth
        disableEnforceFocus disableAutoFocus disableRestoreFocus>
        <DialogTitle>Final Grade — {editingGrade && getStudentLabel(editingGrade.enrollment.studentId)}</DialogTitle>
        <DialogContent>
          {editingGrade && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" icon={<Info />}>
                    <strong>Computed Score:</strong>{' '}
                    {editingGrade.computedScore !== null
                      ? `${editingGrade.computedScore.toFixed(2)} / 100`
                      : 'Not available'}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      This is calculated from weighted grade items. The auto-suggested letter grade is{' '}
                      <strong>{editingGrade.autoLetter}</strong>.
                    </Typography>
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Letter Grade (override if needed)</InputLabel>
                    <Select
                      value={overrideLetter}
                      onChange={(e) => setOverrideLetter(e.target.value)}
                      label="Letter Grade (override if needed)"
                    >
                      {LETTERS.map(l => (
                        <MenuItem key={l} value={l}>
                          {l} ({LETTER_TO_POINT[l].toFixed(2)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? <CircularProgress size={20} /> : 'Save Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FinalGradesTab;