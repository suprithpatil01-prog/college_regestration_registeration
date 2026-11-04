'use client';

import React from 'react';
import { StudentRecord } from '@/lib/types';

interface SuccessReceiptProps {
  record: StudentRecord;
}

export function SuccessReceipt({ record }: SuccessReceiptProps) {
  const isMinor = record.age < 18;

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="success-receipt" aria-live="polite">
      <div className="receipt-icon">✓</div>
      <div className="receipt-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="receipt-kicker">
            K.L.E. INSTITUTE OF TECHNOLOGY · PROVISIONAL ADMISSION ACKNOWLEDGMENT
          </div>
          <button
            type="button"
            className="button button-light"
            onClick={handlePrint}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            🖨 Print Slip
          </button>
        </div>
        <h2>Provisional Admission Confirmed: {record.name}</h2>
        <p>
          Candidate credentials have been validated according to VTU Belagavi &amp; AICTE eligibility norms.
          Official admission receipt has been generated.
        </p>

        <div className="receipt-grid">
          <div>
            <small>VTU USN</small>
            <strong>{record.usn}</strong>
          </div>
          <div>
            <small>ALLOTTED BRANCH</small>
            <strong>{record.course}</strong>
          </div>
          <div>
            <small>ELIGIBILITY STATUS</small>
            <strong className={isMinor ? 'minor-text' : 'adult-text'}>
              {record.age} · {isMinor ? 'Minor' : 'Adult'}
            </strong>
          </div>
          <div>
            <small>OFFICIAL CONTACT</small>
            <strong>{record.email}</strong>
          </div>
        </div>

        {record.address && (
          <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '9px', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
              RESIDENTIAL ADDRESS
            </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{record.address}</span>
          </div>
        )}
      </div>
    </section>
  );
}
