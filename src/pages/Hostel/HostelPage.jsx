import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Home, MeetingRoom, PersonAdd } from '@mui/icons-material';
import HostelsTab from './tabs/HostelsTab';
import HostelRoomsTab from './tabs/HostelRoomsTab';
import AllocationsTab from './tabs/AllocationsTab';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function HostelPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Hostel Management</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Manage hostels, rooms, and student housing allocations.
      </Typography>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newVal) => setTabValue(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<Home />} label="Hostels" />
          <Tab icon={<MeetingRoom />} label="Rooms" />
          <Tab icon={<PersonAdd />} label="Allocations" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}><HostelsTab /></TabPanel>
          <TabPanel value={tabValue} index={1}><HostelRoomsTab /></TabPanel>
          <TabPanel value={tabValue} index={2}><AllocationsTab /></TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

export default HostelPage;