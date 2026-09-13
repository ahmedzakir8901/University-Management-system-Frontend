import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Home, MeetingRoom, PersonAdd } from '@mui/icons-material';
import HostelsTab from './tabs/HostelsTab';
import HostelRoomsTab from './tabs/HostelRoomsTab';
import AllocationsTab from './tabs/AllocationsTab';
import { useAuth } from '../../context/AuthContext'; // <-- NEW

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function HostelPage() {
  const { user } = useAuth(); // <-- Get current user
  const isStudent = user?.role === 'STUDENT';

  // Students start on the Allocations tab (index 2); Admins start on Hostels (index 0)
  const [tabValue, setTabValue] = useState(isStudent ? 2 : 0);

  return (
    <Box>
      {/* Dynamic title and description based on role */}
      <Typography variant="h4" gutterBottom>
        {isStudent ? 'My Hostel' : 'Hostel Management'}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {isStudent
          ? 'View your current hostel room allocation.'
          : 'Manage hostels, rooms, and student housing allocations.'}
      </Typography>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newVal) => setTabValue(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {/* Admin-only tabs */}
          {!isStudent && <Tab icon={<Home />} label="Hostels" />}
          {!isStudent && <Tab icon={<MeetingRoom />} label="Rooms" />}

          {/* Everyone can see this tab (labeled differently for students) */}
          <Tab icon={<PersonAdd />} label={isStudent ? 'My Allocation' : 'Allocations'} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Admin-only tab panels */}
          {!isStudent && (
            <>
              <TabPanel value={tabValue} index={0}><HostelsTab /></TabPanel>
              <TabPanel value={tabValue} index={1}><HostelRoomsTab /></TabPanel>
            </>
          )}

          {/* Everyone sees allocations */}
          <TabPanel value={tabValue} index={2}><AllocationsTab /></TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

export default HostelPage;