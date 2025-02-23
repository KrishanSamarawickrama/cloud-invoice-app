import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/Dialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Simple in-memory unique ID generator
const generateId = (() => {
  let counter = 1;
  return () => counter++;
})();

function BookModal({ open, onClose, onSave, initialData }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [year, setYear] = useState(initialData?.year || "");

  const handleSave = () => {
    const bookData = {
      id: initialData?.id || generateId(),
      title,
      author,
      year
    };
    onSave(bookData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Book" : "Add Book"}</DialogTitle>
          <DialogDescription>Provide the details for your book.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <label className="flex flex-col">
            <span className="mb-1 font-medium">Title</span>
            <input className="border border-gray-300 rounded-md px-2 py-1" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="mb-1 font-medium">Author</span>
            <input className="border border-gray-300 rounded-md px-2 py-1" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </label>
          <label className="flex flex-col">
            <span className="mb-1 font-medium">Year</span>
            <input className="border border-gray-300 rounded-md px-2 py-1" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          </label>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{initialData ? "Update" : "Save"}</Button>
        </DialogFooter>
      </div>
    </div>
  );
}

export default function BooksViteReactApp() {
  const [books, setBooks] = useState([
    { id: 1, title: "Book One", author: "Author A", year: "2020" },
    { id: 2, title: "Book Two", author: "Author B", year: "2021" },
    { id: 3, title: "Book Three", author: "Author C", year: "2022" }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [bookToEdit, setBookToEdit] = useState(null);

  const handleAddBook = () => {
    setBookToEdit(null);
    setShowModal(true);
  };

  const handleEditBook = (book) => {
    setBookToEdit(book);
    setShowModal(true);
  };

  const handleDeleteBook = (id) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  const handleSaveBook = (newBook) => {
    setBooks((prevBooks) => {
      const existing = prevBooks.find((b) => b.id === newBook.id);
      return existing ? prevBooks.map((b) => (b.id === newBook.id ? newBook : b)) : [...prevBooks, newBook];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Book Manager</h1>
        <Button onClick={handleAddBook} className="rounded-2xl shadow-md">Add Book</Button>
      </div>
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <motion.div key={book.id} layout>
            <Card className="rounded-2xl shadow hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="text-xl mb-2">{book.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Author: {book.author}</p>
                <p className="text-gray-700">Year: {book.year}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => handleEditBook(book)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDeleteBook(book.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {showModal && (
        <BookModal open={showModal} onClose={() => setShowModal(false)} onSave={handleSaveBook} initialData={bookToEdit} />
      )}
    </div>
  );
}
