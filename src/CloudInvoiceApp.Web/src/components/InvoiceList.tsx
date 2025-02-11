import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5101/api/invoices')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const columns = [
    { field: 'invoiceNumber', headerName: 'Invoice Number', width: 150 },
    { field: 'invoiceDate', headerName: 'Invoice Date', width: 150 },
    { field: 'fileName', headerName: 'File Name', width: 200 },
  ];

  if (loading) return <div className="p-4 flex justify-center items-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Invoices
        </h1>
        <div style={{ height: 400, width: '100%' }} className="rounded-lg overflow-hidden">
          <DataGrid
            rows={invoices}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
