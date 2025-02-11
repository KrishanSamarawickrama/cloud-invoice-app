import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';

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
    { 
      field: 'invoiceNumber', 
      headerName: 'Invoice Number', 
      width: 150,
      renderCell: (params) => (
        <Link 
          to={`/invoices/edit/${params.row.id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          {params.value}
        </Link>
      )
    },
    { field: 'invoiceDate', headerName: 'Invoice Date', width: 150 },
    { field: 'fileName', headerName: 'File Name', width: 200 },
  ];

  if (loading) return <div className="p-4 flex justify-center items-center">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#27445D] to-[#497D74] bg-clip-text text-transparent">
        Invoices
      </h1>
      <div className="rounded-lg overflow-hidden border border-[#71BBB2]/20">
        <DataGrid
          rows={invoices}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          checkboxSelection
          disableSelectionOnClick
          autoHeight
          sx={{
            backgroundColor: 'white',
            border: 'none',
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#27445D',
              color: 'white'
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#EFE9D5'
            }
          }}
        />
      </div>
    </div>
  );
};

export default InvoiceList;
