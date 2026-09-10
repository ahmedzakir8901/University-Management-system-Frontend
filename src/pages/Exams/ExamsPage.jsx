import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { EventNote, Chair } from '@mui/icons-material';
import ExamsTab from './tabs/ExamsTab';
import SeatingTab from './tabs/SeatingTab';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ExamsPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Exams & Seating</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Schedule exams and assign seat numbers to students.
      </Typography>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newVal) => setTabValue(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<EventNote />} label="Exams" />
          <Tab icon={<Chair />} label="Exam Seating" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}><ExamsTab /></TabPanel>
          <TabPanel value={tabValue} index={1}><SeatingTab /></TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

export default ExamsPage;