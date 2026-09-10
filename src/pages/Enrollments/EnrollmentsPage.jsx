import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { HowToReg, HourglassEmpty } from '@mui/icons-material';
import EnrollmentsTab from './tabs/EnrollmentsTab';
import WaitlistsTab from './tabs/WaitlistsTab';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function EnrollmentsPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Enrollments & Waitlists</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Manage student course registrations and waitlists.
      </Typography>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newVal) => setTabValue(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<HowToReg />} label="Enrollments" />
          <Tab icon={<HourglassEmpty />} label="Waitlists" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}><EnrollmentsTab /></TabPanel>
          <TabPanel value={tabValue} index={1}><WaitlistsTab /></TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

export default EnrollmentsPage;