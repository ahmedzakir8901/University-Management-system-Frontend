// src/services/financeService.js

// Mock data for students (to populate dropdowns)
const mockStudents = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith' },
  { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown' },
  { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson' },
];

// Mock data for academic terms (Fall 2026, Spring 2027, etc.)
const mockTerms = [
  { id: 1, name: 'Fall 2026', code: 'FALL26' },
  { id: 2, name: 'Spring 2027', code: 'SPRING27' },
];

// Mock invoices based on your student_invoices table
const mockInvoices = [
  {
    id: 1,
    studentId: 1,
    termId: 1,
    invoiceNumber: 'INV-2026-001',
    totalAmount: 1500.00,
    dueDate: '2026-09-15',
    status: 'PAID',
    payments: [
      { id: 1, transactionReference: 'TXN-12345', amountPaid: 1500.00, paymentMethod: 'CREDIT_CARD', paymentDate: '2026-09-01' }
    ]
  },
  {
    id: 2,
    studentId: 2,
    termId: 1,
    invoiceNumber: 'INV-2026-002',
    totalAmount: 1800.50,
    dueDate: '2026-09-15',
    status: 'UNPAID',
    payments: []
  },
  {
    id: 3,
    studentId: 3,
    termId: 2,
    invoiceNumber: 'INV-2026-003',
    totalAmount: 1200.00,
    dueDate: '2026-01-15',
    status: 'OVERDUE',
    payments: [
      { id: 2, transactionReference: 'TXN-67890', amountPaid: 500.00, paymentMethod: 'BANK_TRANSFER', paymentDate: '2026-01-05' }
    ]
  },
  {
    id: 4,
    studentId: 4,
    termId: 2,
    invoiceNumber: 'INV-2026-004',
    totalAmount: 2000.00,
    dueDate: '2026-09-20',
    status: 'PARTIALLY_PAID',
    payments: [
      { id: 3, transactionReference: 'TXN-11111', amountPaid: 1000.00, paymentMethod: 'STRIPE', paymentDate: '2026-09-10' }
    ]
  }
];

export const financeService = {
  getInvoices: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockInvoices;
  },

  getStudents: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockStudents;
  },

  getTerms: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockTerms;
  },

  createInvoice: async (invoiceData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newInvoice = {
      id: Date.now(),
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'UNPAID',
      payments: [],
      ...invoiceData
    };
    mockInvoices.push(newInvoice);
    return newInvoice;
  },

  // Record a payment against an invoice
  makePayment: async (invoiceId, paymentData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const invoice = mockInvoices.find((inv) => inv.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    
    const newPayment = {
      id: Date.now(),
      transactionReference: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentDate: new Date().toISOString(),
      ...paymentData
    };
    
    invoice.payments.push(newPayment);
    
    // Update invoice status based on total paid vs total amount
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountPaid, 0);
    if (totalPaid >= invoice.totalAmount) {
      invoice.status = 'PAID';
    } else if (totalPaid > 0) {
      invoice.status = 'PARTIALLY_PAID';
    } else {
      invoice.status = 'UNPAID';
    }
    
    return newPayment;
  },

  deleteInvoice: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockInvoices.findIndex((inv) => inv.id === id);
    if (index !== -1) mockInvoices.splice(index, 1);
    return { success: true };
  }
};