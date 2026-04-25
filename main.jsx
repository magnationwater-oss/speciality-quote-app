import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import jsPDF from 'jspdf';
import './style.css';

function App() {
  const [type, setType] = useState('Quotation');
  const [quoteNumber, setQuoteNumber] = useState(108026);
  const [client, setClient] = useState('');
  const [address, setAddress] = useState('');
  const [project, setProject] = useState('Waterproofing');
  const [paymentTerms, setPaymentTerms] = useState('70% Deposit');
  const [startDate, setStartDate] = useState('To Be Confirmed');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('speciality_quote_number');
    if (saved) setQuoteNumber(Number(saved));
  }, []);

  const total = items.reduce((sum, item) => sum + Number(item.rate || 0), 0);

  const addItem = () => {
    if (!description.trim()) return;
    setItems([...items, { description: description.trim(), rate: Number(rate || 0) }]);
    setDescription('');
    setRate('');
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const generatePDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const img = new Image();
    img.src = '/logo.jpg';
    await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });

    if (img.complete) doc.addImage(img, 'JPEG', 10, 10, 75, 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`${type.toUpperCase()}# [${quoteNumber}]`, 145, 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
    doc.text(`DATE: ${today}`, 145, 22);

    doc.setFontSize(10);
    doc.text('Attention:', 10, 45);
    doc.text(client || 'Client Name', 10, 51);
    const addressLines = doc.splitTextToSize(address || 'Client Address', 90);
    doc.text(addressLines, 10, 57);

    doc.setFillColor(235, 235, 235);
    doc.rect(10, 78, 190, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(type.toUpperCase(), 12, 85);
    doc.text('JOB', 55, 85);
    doc.text('PAYMENT TERMS', 100, 85);
    doc.text('START DATE', 155, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(project || 'Waterproofing', 55, 95);
    doc.text(paymentTerms, 100, 95);
    doc.text(startDate, 155, 95);

    let y = 112;
    doc.setFillColor(235, 235, 235);
    doc.rect(10, y - 6, 190, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('LINE ITEM', 12, y);
    doc.text('DESCRIPTION', 42, y);
    doc.text('RATE PER UNIT', 130, y);
    doc.text('LINE TOTAL', 170, y);
    doc.setFont('helvetica', 'normal');
    y += 10;

    items.forEach((item, index) => {
      const lines = doc.splitTextToSize(item.description, 78);
      doc.text(String(index + 1), 15, y);
      doc.text(lines, 42, y);
      doc.text(`R ${item.rate.toFixed(2)}`, 130, y);
      doc.text(`R ${item.rate.toFixed(2)}`, 170, y);
      y += Math.max(8, lines.length * 5);
    });

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`TOTAL R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 155, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Jannie du Plessis', 10, 255);
    doc.text('Cell: 076 266 7293', 10, 260);
    doc.text('jannie@waterproofmyroof.co.za', 10, 265);
    doc.text('www.waterproofmyroof.co.za', 10, 270);
    doc.setFont('helvetica', 'bold');
    doc.text('PLEASE USE THE INVOICE / QUOTE NUMBER AS REFERENCE:', 105, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('SPECIALITY CAPE', 105, 262);
    doc.text('CAPITEC BANK', 105, 267);
    doc.text('ACCOUNT NUMBER: 1229349683', 105, 272);

    doc.save(`${type}-${quoteNumber}-${client || 'client'}.pdf`);
    const next = quoteNumber + 1;
    setQuoteNumber(next);
    localStorage.setItem('speciality_quote_number', String(next));
  };

  return <main className="wrap">
    <section className="card">
      <img src="/logo.jpg" className="logo" />
      <h1>Speciality Quote System</h1>
      <div className="grid two"><select value={type} onChange={e=>setType(e.target.value)}><option>Quotation</option><option>Invoice</option></select><input value={quoteNumber} onChange={e=>setQuoteNumber(Number(e.target.value))} type="number" /></div>
      <input placeholder="Client / Body Corporate" value={client} onChange={e=>setClient(e.target.value)} />
      <textarea placeholder="Client address" value={address} onChange={e=>setAddress(e.target.value)} />
      <div className="grid three"><input placeholder="Job" value={project} onChange={e=>setProject(e.target.value)} /><input placeholder="Payment terms" value={paymentTerms} onChange={e=>setPaymentTerms(e.target.value)} /><input placeholder="Start date" value={startDate} onChange={e=>setStartDate(e.target.value)} /></div>
      <div className="grid two"><input placeholder="Line item description" value={description} onChange={e=>setDescription(e.target.value)} /><input placeholder="Amount R" value={rate} onChange={e=>setRate(e.target.value)} type="number" /></div>
      <button onClick={addItem}>Add Line Item</button>
      <button className="primary" onClick={generatePDF}>Download PDF</button>
    </section>
    <section className="card"><h2>Preview: {type} #{quoteNumber}</h2>{items.map((item,i)=><div className="line" key={i}><span>{i+1}. {item.description}</span><b>R {item.rate.toFixed(2)}</b><button onClick={()=>removeItem(i)}>Remove</button></div>)}<h2 className="total">Total: R {total.toFixed(2)}</h2></section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
