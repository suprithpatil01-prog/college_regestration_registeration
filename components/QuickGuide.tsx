'use client';

import React from 'react';

export function QuickGuide() {
  return (
    <aside className="right-column">
      <section id="help" className="panel guide-panel">
        <div className="guide-heading">
          <span className="guide-mark">✦</span>
          <div>
            <h2>Admission Guidelines</h2>
            <p>VTU Belagavi &amp; KLEIT Verification Norms</p>
          </div>
        </div>

        <ul className="guide-list">
          <li>
            <span className="guide-check">✓</span>
            <span>
              <strong>Candidate Name</strong>
              <small>Must strictly match SSLC / 10th Standard marks card certificate.</small>
            </span>
          </li>
          <li>
            <span className="guide-check">✓</span>
            <span>
              <strong>VTU USN Format</strong>
              <small>Example: <code>2KE24CS164</code> (2: Region, KE: KLEIT, 24: Year, CS: Branch, 164: Roll).</small>
            </span>
          </li>
          <li>
            <span className="guide-check">✓</span>
            <span>
              <strong>Official Email &amp; Phone</strong>
              <small>Used for VTU enrollment numbers and semester exam hall tickets.</small>
            </span>
          </li>
          <li>
            <span className="guide-check">✓</span>
            <span>
              <strong>Date of Birth &amp; Age</strong>
              <small>Calculated from DD/MM/YYYY. Candidates under 18 require Parent/Guardian co-signing.</small>
            </span>
          </li>
        </ul>

        <div className="guide-note">
          <span>ⓘ</span>
          <p>
            Candidates allotted via KEA / CET / COMEDK or Management Quota must submit original certificates to the Registrar Office.
          </p>
        </div>
      </section>

      <section className="college-highlight-card">
        <div className="highlight-tag">INSTITUTIONAL CODE: 2KE</div>
        <h3>K.L.E. Institute of Technology</h3>
        <p>
          Empowering engineering minds with industry-aligned curriculum, world-class labs, and top-tier campus placements.
        </p>
        <div className="vtu-info-chips">
          <span>NAAC Accredited</span>
          <span>NBA Accredited</span>
          <span>AICTE Approved</span>
          <span>VTU Affiliated</span>
        </div>
      </section>
    </aside>
  );
}
