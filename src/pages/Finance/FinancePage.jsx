import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Receipt, AttachMoney } from '@mui/icons-material';
import InvoicesTab from './tabs/InvoicesTab';
import FeeStructuresTab from './tabs/FeeStructuresTab';
import { useAuth } from '../../context/AuthContext';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function FinancePage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isStudent ? 'My Finance' : 'Finance Management'}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {isStudent
          ? 'View your invoices and make payments.'
          : 'Manage invoices, payments, and department fee structures.'}
      </Typography>

      <Paper elevation={2}>
        <Tabs
          value={tabValue}
          onChange={(e, newVal) => setTabValue(newVal)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<Receipt />} label={isStudent ? 'My Invoices' : 'Invoices'} />
          {/* Only show Fee Structures tab to Admins */}
          {!isStudent && <Tab icon={<AttachMoney />} label="Fee Structures" />}
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}><InvoicesTab /></TabPanel>
          {!isStudent && (
            <TabPanel value={tabValue} index={1}><FeeStructuresTab /></TabPanel>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default FinancePage;