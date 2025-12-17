import { useEffect, useState } from 'react';
import '../Dashboard.css';
import { useApiClient } from '../../utils/apiClient.js';
import jsPDF from 'jspdf';
import { validateRequired, validateText, validateNumber } from '../../utils/validations.js';

const ReceptionBilling = () => {
  const { apiFetch } = useApiClient();
  const [invoices, setInvoices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [guests, setGuests] = useState([]);
  const [form, setForm] = useState({
    reservation: '',
    guest: '',
    description: '',
    amount: 0,
    tax: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const loadInvoices = async () => {
    const data = await apiFetch('/api/invoices');
    setInvoices(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadInvoices();
        const [resList, guestList] = await Promise.all([
          apiFetch('/api/reservations'),
          apiFetch('/api/guests'),
        ]);
        setReservations(resList);
        setGuests(guestList);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  const markPaid = async (id) => {
    try {
      await apiFetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'paid' }),
      });
      await loadInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
    
    // Real-time validation
    let fieldError = '';
    if (field === 'reservation' || field === 'guest') {
      fieldError = validateRequired(value, field === 'reservation' ? 'Reservation' : 'Guest');
    } else if (field === 'description') {
      fieldError = validateText(value, 'Description', 1, 200);
    } else if (field === 'amount') {
      fieldError = validateNumber(value, 'Amount', 0, 1000000, true);
    } else if (field === 'tax') {
      fieldError = validateNumber(value, 'Tax', 0, 100000, true);
    }
    
    setFormErrors({ ...formErrors, [field]: fieldError });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const reservationError = validateRequired(form.reservation, 'Reservation');
    const guestError = validateRequired(form.guest, 'Guest');
    const descriptionError = validateText(form.description, 'Description', 1, 200);
    const amountError = validateNumber(form.amount, 'Amount', 0, 1000000, true);
    const taxError = validateNumber(form.tax, 'Tax', 0, 100000, true);
    
    const newErrors = {
      reservation: reservationError,
      guest: guestError,
      description: descriptionError,
      amount: amountError,
      tax: taxError,
    };
    
    setFormErrors(newErrors);
    
    if (reservationError || guestError || descriptionError || amountError || taxError) {
      return;
    }
    
    try {
      await apiFetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify({
          reservation: form.reservation,
          guest: form.guest,
          items: [{ description: form.description, amount: form.amount }],
          tax: form.tax,
        }),
      });
      setForm({
        reservation: '',
        guest: '',
        description: '',
        amount: 0,
        tax: 0,
      });
      setFormErrors({});
      await loadInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  
  const pendingAmount = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  const viewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const exportToPDF = (invoice) => {
    const subtotal = invoice.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const tax = invoice.tax || 0;
    const total = invoice.total || (subtotal + tax);
    const guestName = invoice.guest 
      ? `${invoice.guest.firstName} ${invoice.guest.lastName || ''}` 
      : 'Guest';
    const roomNumber = invoice.reservation?.room?.roomNumber || '-';
    const invoiceDate = invoice.createdAt 
      ? new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString();

    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(42, 60, 255);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('LuxuryStay HMS', 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Invoice', 20, 30);

    // Invoice Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Invoice ID: #${invoice._id.slice(-8).toUpperCase()}`, 20, 50);
    doc.text(`Date: ${invoiceDate}`, 20, 56);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 62);

    // Guest Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(guestName, 20, 82);
    doc.text(`Room: ${roomNumber}`, 20, 88);

    // Items Table
    let yPos = 110;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(249, 250, 251);
    doc.rect(20, yPos - 5, 170, 8, 'F');
    doc.text('Description', 22, yPos);
    doc.text('Amount', 170, yPos, { align: 'right' });
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((item) => {
        doc.text(item.description || 'Item', 22, yPos);
        doc.text(`$${(item.amount || 0).toFixed(2)}`, 170, yPos, { align: 'right' });
        yPos += 7;
      });
    } else {
      doc.text('No items', 22, yPos);
      yPos += 7;
    }

    // Totals
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.text('Subtotal:', 150, yPos, { align: 'right' });
    doc.text(`$${subtotal.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 7;
    
    doc.text('Tax:', 150, yPos, { align: 'right' });
    doc.text(`$${tax.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 7;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 150, yPos, { align: 'right' });
    doc.text(`$${total.toFixed(2)}`, 190, yPos, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    // Save PDF
    doc.save(`Invoice-${invoice._id.slice(-8)}.pdf`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <section className="card metric">
          <h3>Total Revenue</h3>
          <p className="metric-value">${totalRevenue.toLocaleString()}</p>
          <span className="metric-label">Paid invoices</span>
        </section>
        <section className="card metric">
          <h3>Pending Amount</h3>
          <p className="metric-value">${pendingAmount.toLocaleString()}</p>
          <span className="metric-label">Unpaid invoices</span>
        </section>
        <section className="card metric">
          <h3>Total Invoices</h3>
          <p className="metric-value">{invoices.length}</p>
          <span className="metric-label">All invoices</span>
        </section>
        <section className="card metric">
          <h3>Paid Invoices</h3>
          <p className="metric-value">{invoices.filter((inv) => inv.status === 'paid').length}</p>
          <span className="metric-label">Completed payments</span>
        </section>
      </div>

      <section className="card table-card">
        <div className="card-header">
          <h3>Invoices</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const subtotal = inv.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
                  const tax = inv.tax || 0;
                  const total = inv.total || (subtotal + tax);
                  
                  return (
                    <tr key={inv._id}>
                      <td>
                        <strong>#{inv._id.slice(-8).toUpperCase()}</strong>
                      </td>
                      <td>
                        {inv.guest
                          ? `${inv.guest.firstName} ${inv.guest.lastName || ''}`
                          : 'Guest'}
                      </td>
                      <td>
                        {inv.reservation?.room?.roomNumber || '-'}
                      </td>
                      <td>
                        {inv.items?.length > 0 ? (
                          <div style={{ fontSize: '12px' }}>
                            {inv.items.map((item, idx) => (
                              <div key={idx}>{item.description || 'Item'}: ${item.amount || 0}</div>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td>${subtotal.toFixed(2)}</td>
                      <td>${tax.toFixed(2)}</td>
                      <td><strong>${total.toFixed(2)}</strong></td>
                      <td>
                        <span className={`status-badge status-${inv.status}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="table-btn"
                            onClick={() => viewInvoice(inv)}
                            style={{ background: '#10b981', borderColor: '#10b981' }}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="table-btn"
                            onClick={() => exportToPDF(inv)}
                            style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
                          >
                            PDF
                          </button>
                          {inv.status !== 'paid' && (
                            <button
                              type="button"
                              className="table-btn"
                              onClick={() => markPaid(inv._id)}
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="card table-card">
        <div className="card-header">
          <h3>Create Invoice</h3>
        </div>
        <form className="staff-form" onSubmit={handleCreateInvoice}>
          <div>
            <select
              value={form.reservation}
              onChange={(e) => handleFormChange('reservation', e.target.value)}
              onBlur={(e) => handleFormChange('reservation', e.target.value)}
              required
              className={formErrors.reservation ? 'input-error' : ''}
            >
              <option value="">Select reservation</option>
              {reservations.map((r) => (
                <option key={r._id} value={r._id}>
                  {r._id.slice(-6)} · {r.room?.roomNumber}
                </option>
              ))}
            </select>
            {formErrors.reservation && <p className="field-error-text">{formErrors.reservation}</p>}
          </div>
          <div>
            <select
              value={form.guest}
              onChange={(e) => handleFormChange('guest', e.target.value)}
              onBlur={(e) => handleFormChange('guest', e.target.value)}
              required
              className={formErrors.guest ? 'input-error' : ''}
            >
              <option value="">Select guest</option>
              {guests.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.firstName} {g.lastName || ''}
                </option>
              ))}
            </select>
            {formErrors.guest && <p className="field-error-text">{formErrors.guest}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              onBlur={(e) => handleFormChange('description', e.target.value)}
              required
              className={formErrors.description ? 'input-error' : ''}
            />
            {formErrors.description && <p className="field-error-text">{formErrors.description}</p>}
          </div>
          <div>
            <input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => handleFormChange('amount', Number(e.target.value))}
              onBlur={(e) => handleFormChange('amount', Number(e.target.value))}
              required
              min="0"
              step="0.01"
              className={formErrors.amount ? 'input-error' : ''}
            />
            {formErrors.amount && <p className="field-error-text">{formErrors.amount}</p>}
          </div>
          <div>
            <input
              type="number"
              placeholder="Tax"
              value={form.tax}
              onChange={(e) => handleFormChange('tax', Number(e.target.value))}
              onBlur={(e) => handleFormChange('tax', Number(e.target.value))}
              min="0"
              step="0.01"
              className={formErrors.tax ? 'input-error' : ''}
            />
            {formErrors.tax && <p className="field-error-text">{formErrors.tax}</p>}
          </div>
          <button type="submit" className="primary-btn">
            Save Invoice
          </button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </section>

      {showInvoiceModal && selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#111827', fontSize: '24px', fontWeight: 600 }}>Invoice</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => exportToPDF(selectedInvoice)}
                  className="primary-btn"
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Export PDF
                </button>
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setSelectedInvoice(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: '#374151'
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Invoice ID</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    #{selectedInvoice._id.slice(-8).toUpperCase()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>
                    {selectedInvoice.createdAt 
                      ? new Date(selectedInvoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Status</div>
                <span className={`status-badge status-${selectedInvoice.status}`}>
                  {selectedInvoice.status}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Bill To:</h3>
              <div style={{ fontSize: '14px', color: '#374151' }}>
                <div style={{ marginBottom: '4px' }}>
                  {selectedInvoice.guest 
                    ? `${selectedInvoice.guest.firstName} ${selectedInvoice.guest.lastName || ''}`
                    : 'Guest'}
                </div>
                <div style={{ color: '#6b7280' }}>
                  Room: {selectedInvoice.reservation?.room?.roomNumber || '-'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Items:</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{item.description || 'Item'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#111827' }}>
                          ${(item.amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>No items</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
                <span>Subtotal:</span>
                <span>${(selectedInvoice.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#374151' }}>
                <span>Tax:</span>
                <span>${(selectedInvoice.tax || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 600, color: '#111827', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <span>Total:</span>
                <span>${(selectedInvoice.total || ((selectedInvoice.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0) + (selectedInvoice.tax || 0))).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionBilling;


