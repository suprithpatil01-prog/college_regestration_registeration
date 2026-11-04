'use client';

import React from 'react';

interface SidebarProps {
  recordsCount: number;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export function Sidebar({ recordsCount, activeSection, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Admissions navigation">
      <div className="portal-nav-caption">ADMISSIONS WORKSPACE</div>
      <nav className="side-nav">
        <a
          className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('overview');
          }}
        >
          <span className="nav-icon">⌂</span> Overview
        </a>
        <a
          className={`nav-item ${activeSection === 'registration' ? 'active' : ''}`}
          href="#registration"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('registration');
          }}
          aria-current={activeSection === 'registration' ? 'page' : undefined}
        >
          <span className="nav-icon">＋</span> Candidate Registration
        </a>
        <a
          className={`nav-item ${activeSection === 'registrations' ? 'active' : ''}`}
          href="#registrations"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('registrations');
          }}
        >
          <span className="nav-icon">▤</span> Student Roster{' '}
          <span className="nav-count">{recordsCount}</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon">✦</div>
          <strong>Admissions Desk</strong>
          <p>Assistance for VTU counseling & quota verification.</p>
          <a
            href="#help"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('help');
            }}
          >
            Admissions Guidelines <span>↗</span>
          </a>
        </div>

        <div className="user-chip">
          <div className="avatar">KLE</div>
          <div>
            <strong>Registrar Office</strong>
            <small>KLEIT Admissions Cell</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
