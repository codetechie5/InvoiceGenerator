import React, { useState } from 'react';
import axios from 'axios';

const InvoiceForm = () => {
  const [seller, setSeller] = useState({ name: '', address: '', pan: '', gst: '' });
  const [billing, setBilling] = useState({ name: '', address: '', stateCode: '' });
  const [shipping, setShipping] = useState({ name: '', address: '', stateCode: '' });
  const [orderDetails, setOrderDetails] = useState({ orderNo: '', orderDate: '' });
  const [invoiceDetails, setInvoiceDetails] = useState({ invoiceNo: '', invoiceDate: '' });
  const [items, setItems] = useState([{ description: '', unitPrice: 0, quantity: 0, discount: 0 }]);
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [placeOfDelivery, setPlaceOfDelivery] = useState('');
  const [reverseCharge, setReverseCharge] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', unitPrice: 0, quantity: 0, discount: 0 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('signatureImage', signatureImage);

    // Gather all form data into an object
    const invoiceData = {
      seller, billing, shipping, orderDetails, invoiceDetails, items,
      placeOfSupply, placeOfDelivery, reverseCharge,
      signatureImage: signatureImage.name  // Add the file name for backend usage
    };

    try {
      // POST request to the backend
      const response = await axios.post('http://localhost:5000/api/invoice', invoiceData);
      setPdfUrl(response.data.url);  // Set the generated PDF URL
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  return (
    <div>
      <h2>Create Invoice</h2>
      <form onSubmit={handleSubmit}>
        <h3>Seller Details</h3>
        <input type="text" placeholder="Seller Name" onChange={(e) => setSeller({ ...seller, name: e.target.value })} />
        <input type="text" placeholder="Seller Address" onChange={(e) => setSeller({ ...seller, address: e.target.value })} />
        <input type="text" placeholder="PAN" onChange={(e) => setSeller({ ...seller, pan: e.target.value })} />
        <input type="text" placeholder="GST Registration No." onChange={(e) => setSeller({ ...seller, gst: e.target.value })} />

        <h3>Billing Details</h3>
        <input type="text" placeholder="Billing Name" onChange={(e) => setBilling({ ...billing, name: e.target.value })} />
        <input type="text" placeholder="Billing Address" onChange={(e) => setBilling({ ...billing, address: e.target.value })} />
        <input type="text" placeholder="State Code" onChange={(e) => setBilling({ ...billing, stateCode: e.target.value })} />

        <h3>Shipping Details</h3>
        <input type="text" placeholder="Shipping Name" onChange={(e) => setShipping({ ...shipping, name: e.target.value })} />
        <input type="text" placeholder="Shipping Address" onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
        <input type="text" placeholder="State Code" onChange={(e) => setShipping({ ...shipping, stateCode: e.target.value })} />

        <h3>Order Details</h3>
        <input type="text" placeholder="Order No." onChange={(e) => setOrderDetails({ ...orderDetails, orderNo: e.target.value })} />
        <input type="date" onChange={(e) => setOrderDetails({ ...orderDetails, orderDate: e.target.value })} />

        <h3>Invoice Details</h3>
        <input type="text" placeholder="Invoice No." onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNo: e.target.value })} />
        <input type="date" onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceDate: e.target.value })} />

        <h3>Items</h3>
        {items.map((item, index) => (
          <div key={index}>
            <input type="text" placeholder="Description" onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
            <input type="number" placeholder="Unit Price" onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))} />
            <input type="number" placeholder="Quantity" onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))} />
            <input type="number" placeholder="Discount" onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))} />
          </div>
        ))}
        <button type="button" onClick={addItem}>Add Item</button>

        <h3>Other Details</h3>
        <input type="text" placeholder="Place of Supply" onChange={(e) => setPlaceOfSupply(e.target.value)} />
        <input type="text" placeholder="Place of Delivery" onChange={(e) => setPlaceOfDelivery(e.target.value)} />
        <label>
          Reverse Charge:
          <input type="checkbox" onChange={(e) => setReverseCharge(e.target.checked)} />
        </label>

        <h3>Upload Signature</h3>
        <input type="file" onChange={(e) => setSignatureImage(e.target.files[0])} />

        <button type="submit">Generate Invoice</button>
      </form>

      {pdfUrl && (
        <div>
          <h3>Invoice Generated</h3>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Download PDF</a>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;
