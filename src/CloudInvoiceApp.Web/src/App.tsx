import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import InvoiceList from './components/InvoiceList';
import Sidebar from './components/Sidebar';
import EditInvoice from './components/EditInvoice';

function App() {
  return (
    <Router>
      <div className="min-h-screen min-w-screen bg-[#EFE9D5] flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/invoices/edit/:id" element={<EditInvoice />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
