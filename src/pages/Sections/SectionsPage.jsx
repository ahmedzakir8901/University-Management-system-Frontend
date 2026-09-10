import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Class, Schedule } from '@mui/icons-material';
import SectionsTab from './tabs/SectionsTab';
import SchedulesTab from './tabs/SchedulesTab';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function SectionsPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Course Sections & Timetable</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Manage section offerings and weekly class schedules.
      </Typography>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newVal) => setTabValue(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<Class />} label="Sections" />
          <Tab icon={<Schedule />} label="Class Schedules" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}><SectionsTab /></TabPanel>
          <TabPanel value={tabValue} index={1}><SchedulesTab /></TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

export default SectionsPage;