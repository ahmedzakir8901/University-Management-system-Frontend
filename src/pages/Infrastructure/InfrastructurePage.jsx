import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Apartment, MeetingRoom } from '@mui/icons-material';
import BuildingsTab from './tabs/BuildingsTab';
import RoomsTab from './tabs/RoomsTab';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function InfrastructurePage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Infrastructure</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Manage buildings and rooms across all campuses.
      </Typography>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newVal) => setTabValue(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<Apartment />} label="Buildings" />
          <Tab icon={<MeetingRoom />} label="Rooms" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}><BuildingsTab /></TabPanel>
          <TabPanel value={tabValue} index={1}><RoomsTab /></TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

export default InfrastructurePage;