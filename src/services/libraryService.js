// src/services/libraryService.js

const mockUsers = [
  { id: 1, rollNumber: 'STU001', firstName: 'John', lastName: 'Doe' },
  { id: 2, rollNumber: 'STU002', firstName: 'Jane', lastName: 'Smith' },
  { id: 3, rollNumber: 'FAC001', firstName: 'Robert', lastName: 'Smith' },
];

const mockBooks = [
  { id: 1, isbn: '978-3-16-148410-0', title: 'Introduction to Algorithms', author: 'Cormen', publisher: 'MIT Press', totalCopies: 5, availableCopies: 3 },
  { id: 2, isbn: '978-0-13-235088-4', title: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', totalCopies: 3, availableCopies: 0 }, // Fully issued
  { id: 3, isbn: '978-1-49-195029-4', title: 'React Up and Running', author: 'Stoyan Stefanov', publisher: 'O\'Reilly', totalCopies: 4, availableCopies: 2 },
];

export const libraryService = {
  getBooks: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBooks;
  },

  getUsers: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers;
  },

  createBook: async (bookData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newBook = { 
      id: Date.now(), 
      availableCopies: bookData.totalCopies, // New books are fully available
      ...bookData 
    };
    mockBooks.push(newBook);
    return newBook;
  },

  updateBook: async (id, updatedData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockBooks.findIndex(b => b.id === id);
    if (index !== -1) {
      // If total copies changes, adjust available copies accordingly
      const oldBook = mockBooks[index];
      const issuedCopies = oldBook.totalCopies - oldBook.availableCopies;
      const newTotal = updatedData.totalCopies;
      
      mockBooks[index] = { 
        ...oldBook, 
        ...updatedData, 
        totalCopies: newTotal,
        availableCopies: Math.max(0, newTotal - issuedCopies) 
      };
      return mockBooks[index];
    }
    throw new Error('Book not found');
  },

  deleteBook: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockBooks.findIndex(b => b.id === id);
    if (index !== -1) mockBooks.splice(index, 1);
    return { success: true };
  },

  // NEW CONCEPT: Issue a book (decrease available copies)
  issueBook: async (bookId, userId, dueDate) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const book = mockBooks.find(b => b.id === bookId);
    
    if (!book) throw new Error('Book not found');
    if (book.availableCopies <= 0) throw new Error('No copies available');

    book.availableCopies -= 1;
    // In a real backend, this would also create a record in book_issues table
    console.log(`Book ID ${bookId} issued to User ${userId}, due ${dueDate}`);
    return { success: true };
  },

  // NEW CONCEPT: Return a book (increase available copies)
  returnBook: async (bookId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const book = mockBooks.find(b => b.id === bookId);
    
    if (!book) throw new Error('Book not found');
    
    // Ensure we never exceed the total copies
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    
    return { success: true };
  }
};