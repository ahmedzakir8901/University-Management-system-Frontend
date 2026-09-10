import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Business, AccountTree, CalendarMonth } from '@mui/icons-material';
import CampusesTab from './tabs/CampusesTab';
import DepartmentsTab from './tabs/DepartmentsTab';
import TermsTab from './tabs/TermsTab';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function SettingsPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Manage academic structure: campuses, departments, and terms.
      </Typography>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newVal) => setTabValue(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<Business />} label="Campuses" />
          <Tab icon={<AccountTree />} label="Departments" />
          <Tab icon={<CalendarMonth />} label="Academic Terms" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}><CampusesTab /></TabPanel>
          <TabPanel value={tabValue} index={1}><DepartmentsTab /></TabPanel>
          <TabPanel value={tabValue} index={2}><TermsTab /></TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}

export default SettingsPage;