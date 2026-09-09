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

function FinancePage() {
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

  const filteredInvoices = (invoices || []).filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.studentId.toString().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error loading invoices: {error.message}</Alert>;

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setOpenInvoiceModal(true);
  };

  const handleMakePayment = (invoice) => {
    setSelectedInvoice(invoice);
    setOpenPaymentModal(true);
  };

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Finance Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddInvoice}>Generate Invoice</Button>
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
              <TableCell>Student ID</TableCell>
              <TableCell>Term</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell><strong>{invoice.invoiceNumber}</strong></TableCell>
                <TableCell>{invoice.studentId}</TableCell>
                <TableCell>{invoice.termId}</TableCell>
                <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status.replace('_', ' ')}
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleMakePayment(invoice)}>
                    <Payment />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(invoice.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <InvoiceFormModal open={openInvoiceModal} onClose={() => setOpenInvoiceModal(false)} />
      <PaymentFormModal
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        invoice={selectedInvoice}
      />
    </Box>
  );
}

export default FinancePage;