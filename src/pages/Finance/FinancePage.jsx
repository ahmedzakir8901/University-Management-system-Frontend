import React, { useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, IconButton, Chip, CircularProgress, Alert, TextField, InputAdornment
} from '@mui/material';
import { Add, Delete, Search, Payment } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../../services/financeService';
import InvoiceFormModal from '../../components/finance/InvoiceFormModal';
import PaymentFormModal from '../../components/finance/PaymentFormModal';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import RoleGate from '../../components/RoleGate';
import { useAuth } from '../../context/AuthContext';
import ExportButton from '../../components/common/ExportButton'; // <-- NEW

function FinancePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: financeService.getInvoices,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: financeService.deleteInvoice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const visibleInvoices = (invoices || []).filter((invoice) => {
    if (user?.role === 'ADMIN') return true;
    if (user?.role === 'STUDENT') return invoice.studentId === user.id;
    return false;
  });

  const filteredInvoices = visibleInvoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading invoices: {error.message}</Alert>;

  const handleAddInvoice = () => { setSelectedInvoice(null); setOpenInvoiceModal(true); };
  const handleMakePayment = (invoice) => { setSelectedInvoice(invoice); setOpenPaymentModal(true); };
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) deleteMutation.mutate(id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'UNPAID': return 'error';
      case 'PARTIALLY_PAID': return 'warning';
      case 'OVERDUE': return 'default';
      default: return 'default';
    }
  };

  const isStudent = user?.role === 'STUDENT';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4">
          {isStudent ? 'My Invoices' : 'Finance Management'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ExportButton
            title="Invoices Report"
            fileName="invoices_report"
            columns={['Invoice #', 'Student ID', 'Term', 'Amount', 'Due Date', 'Status']}
            rows={filteredInvoices.map(inv => [
              inv.invoiceNumber,
              inv.studentId,
              inv.termId,
              formatCurrency(inv.totalAmount),
              formatDate(inv.dueDate),
              inv.status,
            ])}
          />
          <RoleGate allowedRoles={['ADMIN']}>
            <Button variant="contained" startIcon={<Add />} onClick={handleAddInvoice}>
              Generate Invoice
            </Button>
          </RoleGate>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth variant="outlined" placeholder="Search by invoice number..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: { startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              {!isStudent && <TableCell>Student ID</TableCell>}
              <TableCell>Term</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isStudent ? 6 : 7} align="center">
                  <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                    {isStudent ? 'You have no invoices on record.' : 'No invoices found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} hover>
                  <TableCell><strong>{invoice.invoiceNumber}</strong></TableCell>
                  {!isStudent && <TableCell>{invoice.studentId}</TableCell>}
                  <TableCell>{invoice.termId}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>
                    <Chip label={invoice.status.replace('_', ' ')} color={getStatusColor(invoice.status)} size="small" />
                  </TableCell>
                  <TableCell>
                    {invoice.status !== 'PAID' && (
                      <IconButton color="primary" onClick={() => handleMakePayment(invoice)} title="Make Payment">
                        <Payment />
                      </IconButton>
                    )}
                    <RoleGate allowedRoles={['ADMIN']}>
                      <IconButton color="error" onClick={() => handleDelete(invoice.id)} title="Delete">
                        <Delete />
                      </IconButton>
                    </RoleGate>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <InvoiceFormModal open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} />
      <PaymentFormModal open={openPaymentModal} onClose={() => setOpenPaymentModal(false)} invoice={selectedInvoice} />
    </Box>
  );
}

export default FinancePage;