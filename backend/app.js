const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const numToWords = require('num-to-words');  // Convert numbers to words

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'  // Allow React frontend
}));

// Helper function to convert tax rate and types
const calculateTax = (netAmount, placeOfSupply, placeOfDelivery) => {
  let taxType, taxAmount, totalAmount;
  const taxRate = 0.18;  // 18% tax

  if (placeOfSupply === placeOfDelivery) {
    // CGST + SGST case (9% each)
    taxType = 'CGST + SGST';
    taxAmount = netAmount * 0.09;
    totalAmount = netAmount + (2 * taxAmount);  // Net + CGST + SGST
  } else {
    // IGST case (18%)
    taxType = 'IGST';
    taxAmount = netAmount * taxRate;
    totalAmount = netAmount + taxAmount;  // Net + IGST
  }
  return { taxType, taxAmount, totalAmount };
};

// Endpoint to generate invoice
app.post('/api/invoice', (req, res) => {
  const {
    seller, billing, shipping, orderDetails, invoiceDetails,
    items, placeOfSupply, placeOfDelivery, reverseCharge, signatureImage
  } = req.body;

  // Create PDF document
  const doc = new PDFDocument();
  const fileName = `invoice-${Date.now()}.pdf`;
  const pdfPath = path.join(__dirname, 'invoices', fileName);

  // Ensure 'invoices' folder exists
  if (!fs.existsSync(path.join(__dirname, 'invoices'))) {
    fs.mkdirSync(path.join(__dirname, 'invoices'));
  }

  doc.pipe(fs.createWriteStream(pdfPath));

  // Add Logo Placeholder
  doc.image('path/to/logo.png', 50, 45, { width: 150 });

  // Invoice Header Information
  doc.fontSize(20).text('Tax Invoice/Bill of Supply/Cash Memo', { align: 'right' });
  doc.fontSize(12).text('Original for Recipient', { align: 'right' });

  // Seller Details
  doc.text(`Sold By: ${seller.name}`);
  doc.text(seller.address);
  doc.text(`PAN No: ${seller.pan}`);
  doc.text(`GST Registration No: ${seller.gst}`);

  // Billing Details
  doc.moveDown().text('Billing Address:', { underline: true });
  doc.text(billing.name);
  doc.text(billing.address);

  // Shipping Details
  doc.moveDown().text('Shipping Address:', { underline: true });
  doc.text(shipping.name);
  doc.text(shipping.address);

  // Order and Invoice Details
  doc.moveDown().text(`Order No: ${orderDetails.orderNo}`);
  doc.text(`Order Date: ${orderDetails.orderDate}`);
  doc.text(`Invoice No: ${invoiceDetails.invoiceNo}`);
  doc.text(`Invoice Date: ${invoiceDetails.invoiceDate}`);

  // Table for Items
  doc.moveDown().text('Items:', { underline: true });
  items.forEach(item => {
    const netAmount = item.unitPrice * item.quantity - (item.discount || 0);
    const { taxType, taxAmount, totalAmount } = calculateTax(netAmount, placeOfSupply, placeOfDelivery);

    doc.text(`Item: ${item.description}, Unit Price: ${item.unitPrice}, Qty: ${item.quantity}, Net: ${netAmount}`);
    doc.text(`Tax Type: ${taxType}, Tax Amount: ${taxAmount}, Total Amount: ${totalAmount}`);
  });

  // Total Calculation
  const totalNetAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalTaxAmount = items.reduce((sum, item) => sum + calculateTax(item.unitPrice * item.quantity, placeOfSupply, placeOfDelivery).taxAmount, 0);
  const totalAmount = totalNetAmount + totalTaxAmount;

  doc.moveDown().text(`Total Net Amount: ${totalNetAmount}`);
  doc.text(`Total Tax Amount: ${totalTaxAmount}`);
  doc.text(`Total Amount: ${totalAmount}`);

  // Convert total to words
  doc.text(`Amount in Words: ${numToWords(totalAmount).toUpperCase()} only`);

  // Signature Section
  doc.moveDown().text(`For ${seller.name}:`);
  doc.image(signatureImage, 400, doc.y, { width: 100 });
  doc.text('Authorised Signatory');

  // Finalize PDF
  doc.end();

  // Send back the PDF URL
  res.json({ url: `http://localhost:5000/invoices/${fileName}` });
});

// Serve invoices folder
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// Start the server
app.listen(5000, () => console.log('Server running on port 5000'));
