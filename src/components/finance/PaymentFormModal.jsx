import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, CircularProgress, Alert, Typography, MenuItem // <--- MenuItem added here!
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '../../services/financeService';
import { formatCurrency } from '../../utils/formatCurrency';
import { toast } from 'react-hot-toast';

function PaymentFormModal({ open, onClose, invoice }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CREDIT_CARD');
  const [error, setError] = useState('');

  useEffect(() => {
    if (invoice) {
      setAmount('');
      setMethod('CREDIT_CARD');
      setError('');
    }
  }, [invoice]);

  const paymentMutation = useMutation({
    mutationFn: (data) => financeService.makePayment(invoice.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Payment recorded successfully!');
      onClose();
    },
    onError: () => toast.error('Failed to record payment'),
  });

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (Number(amount) > invoice.totalAmount) {
      setError('Amount cannot exceed the total invoice amount');
      return;
    }

    paymentMutation.mutate({
      amountPaid: Number(amount),
      paymentMethod: method,
    });
  };

  const totalPaid = invoice?.payments?.reduce((sum, p) => sum + p.amountPaid, 0) || 0;
  const remainingBalance = invoice ? invoice.totalAmount - totalPaid : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Payment</DialogTitle>
      <DialogContent>
        {invoice && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>Invoice:</strong> {invoice.invoiceNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Total Amount:</strong> {formatCurrency(invoice.totalAmount)}
            </Typography>
            <Typography variant="body1" color="success.main">
              <strong>Total Paid:</strong> {formatCurrency(totalPaid)}
            </Typography>
            <Typography variant="body1" color="error.main">
              <strong>Remaining Balance:</strong> {formatCurrency(remainingBalance)}
            </Typography>
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Amount ($)"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          label="Payment Method"
          fullWidth
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
          <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
          <MenuItem value="STRIPE">Stripe</MenuItem>
          <MenuItem value="CASH">Cash</MenuItem>
          <MenuItem value="CHECK">Check</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={paymentMutation.isPending}>
          {paymentMutation.isPending ? <CircularProgress size={24} /> : 'Record Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PaymentFormModal;