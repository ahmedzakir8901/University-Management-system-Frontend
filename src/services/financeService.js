// src/services/financeService.js

const USE_MOCK_DATA = true;

// ============ MOCK DATA ============
const mockStudents = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith' },
  { id: 3, rollNumber: 'STU003', firstName: 'Bob', lastName: 'Brown' },
  { id: 4, rollNumber: 'STU004', firstName: 'Alice', lastName: 'Johnson' },
];

const mockTerms = [
  { id: 1, name: 'Fall 2026', termCode: 'FALL26' },
  { id: 2, name: 'Spring 2027', termCode: 'SPRING27' },
];

const mockDepartments = [
  { id: 1, name: 'Computer Science', code: 'CS' },
  { id: 2, name: 'Mathematics', code: 'MATH' },
  { id: 3, name: 'Physics', code: 'PHY' },
  { id: 4, name: 'Chemistry', code: 'CHEM' },
  { id: 5, name: 'Biology', code: 'BIO' },
];

let mockInvoices = [
  { id: 1, studentId: 1, termId: 1, invoiceNumber: 'INV-2026-001', totalAmount: 1500.00, dueDate: '2026-09-15', status: 'PAID', payments: [{ id: 1, transactionReference: 'TXN-12345', amountPaid: 1500.00, paymentMethod: 'CREDIT_CARD', paymentDate: '2026-09-01' }] },
  { id: 2, studentId: 2, termId: 1, invoiceNumber: 'INV-2026-002', totalAmount: 1800.50, dueDate: '2026-09-15', status: 'UNPAID', payments: [] },
  { id: 3, studentId: 3, termId: 2, invoiceNumber: 'INV-2026-003', totalAmount: 1200.00, dueDate: '2026-01-15', status: 'OVERDUE', payments: [{ id: 2, transactionReference: 'TXN-67890', amountPaid: 500.00, paymentMethod: 'BANK_TRANSFER', paymentDate: '2026-01-05' }] },
  { id: 4, studentId: 4, termId: 2, invoiceNumber: 'INV-2026-004', totalAmount: 2000.00, dueDate: '2026-09-20', status: 'PARTIALLY_PAID', payments: [{ id: 3, transactionReference: 'TXN-11111', amountPaid: 1000.00, paymentMethod: 'STRIPE', paymentDate: '2026-09-10' }] },
];

// NEW: Fee Structures — matches your fee_structures table
let mockFeeStructures = [
  { id: 1, departmentId: 1, termId: 1, tuitionFeePerCredit: 100.00, libraryFee: 50.00, labFee: 150.00, hostelFee: 500.00 },
  { id: 2, departmentId: 2, termId: 1, tuitionFeePerCredit: 80.00,  libraryFee: 50.00, labFee: 0.00,   hostelFee: 500.00 },
  { id: 3, departmentId: 3, termId: 1, tuitionFeePerCredit: 90.00,  libraryFee: 50.00, labFee: 200.00, hostelFee: 500.00 },
  { id: 4, departmentId: 1, termId: 2, tuitionFeePerCredit: 110.00, libraryFee: 55.00, labFee: 160.00, hostelFee: 550.00 },
];

export const financeService = {
  // ============================================================
  // INVOICES
  // ============================================================
  getInvoices: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      return mockInvoices;
    }
  },

  createInvoice: async (invoiceData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const newInvoice = {
        id: Date.now(),
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        status: 'UNPAID',
        payments: [],
        ...invoiceData,
      };
      mockInvoices.push(newInvoice);
      return newInvoice;
    }
  },

  makePayment: async (invoiceId, paymentData) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const invoice = mockInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      const newPayment = {
        id: Date.now(),
        transactionReference: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        paymentDate: new Date().toISOString(),
        ...paymentData,
      };

      invoice.payments.push(newPayment);
      const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountPaid, 0);
      if (totalPaid >= invoice.totalAmount) invoice.status = 'PAID';
      else if (totalPaid > 0) invoice.status = 'PARTIALLY_PAID';
      else invoice.status = 'UNPAID';

      return newPayment;
    }
  },

  deleteInvoice: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      mockInvoices = mockInvoices.filter(inv => inv.id !== id);
      return { success: true };
    }
  },

  // ============================================================
  // FEE STRUCTURES  ← NEW
  // ============================================================
  getFeeStructures: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      return mockFeeStructures;
    }
  },

  createFeeStructure: async (data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));

      // Validation: one structure per (department, term)
      const exists = mockFeeStructures.some(
        fs => fs.departmentId === Number(data.departmentId) && fs.termId === Number(data.termId)
      );
      if (exists) {
        throw new Error('A fee structure already exists for this department and term');
      }

      const newFS = {
        id: Date.now(),
        departmentId: Number(data.departmentId),
        termId: Number(data.termId),
        tuitionFeePerCredit: Number(data.tuitionFeePerCredit),
        libraryFee: Number(data.libraryFee),
        labFee: Number(data.labFee),
        hostelFee: Number(data.hostelFee),
      };
      mockFeeStructures.push(newFS);
      return newFS;
    }
  },

  updateFeeStructure: async (id, data) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      const idx = mockFeeStructures.findIndex(fs => fs.id === id);
      if (idx === -1) throw new Error('Fee structure not found');
      mockFeeStructures[idx] = { ...mockFeeStructures[idx], ...data };
      return mockFeeStructures[idx];
    }
  },

  deleteFeeStructure: async (id) => {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 500));
      mockFeeStructures = mockFeeStructures.filter(fs => fs.id !== id);
      return { success: true };
    }
  },

  // ============================================================
  // LOOKUP DATA
  // ============================================================
  getStudents: async () => mockStudents,
  getTerms: async () => mockTerms,
  getDepartments: async () => mockDepartments,
};