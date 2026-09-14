import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Assignment, Grade, WorkspacePremium } from '@mui/icons-material';
import GradeItemsTab from './tabs/GradeItemsTab';
import StudentGradesTab from './tabs/StudentGradesTab';
import FinalGradesTab from './tabs/FinalGradesTab';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function GradesPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Gradebook</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Manage grade items, student marks, and final course grades.
      </Typography>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newVal) => setTabValue(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<Assignment />} label="Grade Items" />
          <Tab icon={<Grade />} label="Student Grades" />
          <Tab icon={<WorkspacePremium />} label="Final Grades" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}><GradeItemsTab /></TabPanel>
          <TabPanel value={tabValue} index={1}><StudentGradesTab /></TabPanel>
          <TabPanel value={tabValue} index={2}><FinalGradesTab /></TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

export default GradesPage;