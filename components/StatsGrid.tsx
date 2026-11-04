'use client';

import React from 'react';

interface StatsGridProps {
  total: number;
  adults: number;
  minors: number;
}

export function StatsGrid({ total, adults, minors }: StatsGridProps) {
  return (
    <section className="stats-grid" aria-label="Admissions Summary Metrics">
      <article className="stat-card">
        <div className="stat-top">
          <span>Registered Candidates</span>
          <span className="stat-icon navy">▤</span>
        </div>
        <div className="stat-value">{total}</div>
        <div className="stat-foot">
          <span className="stat-dot navy-dot"></span>Session Enrollments
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-top">
          <span>Direct Admissions (Adults)</span>
          <span className="stat-icon green">✓</span>
        </div>
        <div className="stat-value">{adults}</div>
        <div className="stat-foot">
          <span className="stat-dot green-dot"></span>Age 18+ · Direct Consent
        </div>
      </article>

      <article className="stat-card">
        <div className="stat-top">
          <span>Guardian Consent Required</span>
          <span className="stat-icon amber">⚠</span>
        </div>
        <div className="stat-value">{minors}</div>
        <div className="stat-foot">
          <span className="stat-dot amber-dot"></span>Under 18 · Minor Student Undertaking
        </div>
      </article>
    </section>
  );
}
