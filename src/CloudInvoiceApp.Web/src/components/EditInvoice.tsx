import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [fromLines, setFromLines] = useState([]);
  const [toLines, setToLines] = useState([]);
  const [bankDetails, setBankDetails] = useState({});
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5101/api/invoices/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setInvoice(data);
        setFromLines(JSON.parse(data.from));
        setToLines(JSON.parse(data.to));
        setBankDetails(JSON.parse(data.bankDetails));
        setServices(JSON.parse(data.services).map((service, index) => ({
          ...service,
          id: index
        })));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedInvoice = {
        ...invoice,
        from: JSON.stringify(fromLines),
        to: JSON.stringify(toLines),
        bankDetails: JSON.stringify(bankDetails),
        services: JSON.stringify(services.map(({ id, ...service }) => service))
      };

      const response = await fetch(`http://localhost:5101/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedInvoice),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      navigate('/invoices');
    } catch (err) {
      setError(err.message);
    }
  };

  const serviceColumns = [
    { field: 'ServiceName', headerName: 'Service', width: 300, editable: true },
    { field: 'Amount', headerName: 'Amount', width: 150, editable: true, type: 'number' },
  ];

  const calculateTotal = () => {
    return services.reduce((sum, service) => sum + (Number(service.Amount) || 0), 0);
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!invoice) return <div className="p-4">Invoice not found</div>;

  return (
    <div className="container mx-auto bg-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-purple-500">
        Edit Invoice
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Invoice Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900">Invoice Number</label>
            <input
              type="text"
              value={invoice?.invoiceNumber}
              onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Invoice Date</label>
            <input
              type="date"
              value={invoice?.invoiceDate?.split('T')[0]}
              onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* From Address */}
        <div className="border p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">From</h2>
          {fromLines.map((line, index) => (
            <input
              key={index}
              type="text"
              value={line}
              onChange={(e) => {
                const newLines = [...fromLines];
                newLines[index] = e.target.value;
                setFromLines(newLines);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          ))}
        </div>

        {/* To Address */}
        <div className="border p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">To</h2>
          {toLines.map((line, index) => (
            <input
              key={index}
              type="text"
              value={line}
              onChange={(e) => {
                const newLines = [...toLines];
                newLines[index] = e.target.value;
                setToLines(newLines);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          ))}
        </div>

        {/* Bank Details */}
        <div className="border p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Bank Details</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(bankDetails).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-900">{key}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setBankDetails({ ...bankDetails, [key]: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="border p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Services</h2>
          <div style={{ height: 400 }}>
            <DataGrid
              rows={services}
              columns={serviceColumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              onCellEditCommit={(params) => {
                const updatedServices = services.map(service =>
                  service.id === params.id
                    ? { ...service, [params.field]: params.value }
                    : service
                );
                setServices(updatedServices);
              }}
            />
          </div>
          <div className="mt-4 text-right">
            <div className="inline-block bg-gray-100 px-6 py-3 rounded-lg">
              <span className="text-gray-700 font-medium">Total: </span>
              <span className="text-lg font-bold">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInvoice;
