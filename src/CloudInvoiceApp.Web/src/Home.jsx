import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';

const Home = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch invoices on component mount
  useEffect(() => {
    fetch('http://localhost:5101/api/invoices')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Assuming data is an array of invoice objects
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

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <div style={{ height: 400, width: '100%' }}>
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
  );
};

export default Home;
