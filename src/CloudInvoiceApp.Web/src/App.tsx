import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import InvoiceList from './components/InvoiceList';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="min-h-screen min-w-screen bg-gradient-to-br from-gray-100 to-white flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/invoices" element={<InvoiceList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
