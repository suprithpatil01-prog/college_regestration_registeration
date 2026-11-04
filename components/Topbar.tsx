'use client';

import React from 'react';

export function Topbar() {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>KLEIT Admissions</span>
        <span className="crumb-sep">/</span>
        <strong>Student Enrollment Portal</strong>
      </div>
      <div className="topbar-right">
        <span className="academic-year-badge">AY 2026–2027</span>
        <span className="session-pill">
          <span className="live-dot"></span> Admissions Desk Active
        </span>
      </div>
    </header>
  );
}
