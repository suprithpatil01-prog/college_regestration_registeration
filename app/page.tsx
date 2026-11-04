'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { StatsGrid } from '@/components/StatsGrid';
import { SuccessReceipt } from '@/components/SuccessReceipt';
import { QuickGuide } from '@/components/QuickGuide';
import { RegistrationForm } from '@/components/RegistrationForm';
import { RecordsTable } from '@/components/RecordsTable';
import { FormErrors, StudentFormData, StudentRecord } from '@/lib/types';
import { validateStudentForm } from '@/lib/validation';

export default function StudentRegistrationPortal() {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [lastSubmitted, setLastSubmitted] = useState<StudentRecord | null>(null);
  const [generalError, setGeneralError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState('registration');

  // Load initial records from server or local session storage
  useEffect(() => {
    async function loadRecords() {
      try {
        const res = await fetch('/api/records');
        if (res.ok) {
          const data = await res.json();
          if (data.records && Array.isArray(data.records) && data.records.length > 0) {
            setRecords(data.records);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch server records, using session storage fallback');
      }

      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('kleit_admissions_records');
        if (cached) {
          try {
            setRecords(JSON.parse(cached));
          } catch (e) {
            // ignore JSON error
          }
        }
      }
    }

    loadRecords();
  }, []);

  // Sync to session storage whenever records change
  useEffect(() => {
    if (typeof window !== 'undefined' && records.length > 0) {
      sessionStorage.setItem('kleit_admissions_records', JSON.stringify(records));
    }
  }, [records]);

  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
    setGeneralError('');
  }, []);

  const handleFormSubmit = async (formData: StudentFormData): Promise<boolean> => {
    setGeneralError('');

    // 1. Client-side validation check
    const clientValidation = validateStudentForm(formData, records);
    if (!clientValidation.isValid) {
      setFieldErrors(clientValidation.errors);
      return false;
    }

    setIsSubmitting(true);

    try {
      // 2. Server API submission
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          setFieldErrors(result.errors);
          if (result.errors.general) {
            setGeneralError(result.errors.general);
          }
        } else {
          setGeneralError('Registration failed. Please check the credentials and try again.');
        }
        return false;
      }

      // Successfully registered
      const newRecord = result.record as StudentRecord;
      setRecords((prev) => [newRecord, ...prev.filter((r) => r.usn !== newRecord.usn)].slice(0, 30));
      setLastSubmitted(newRecord);
      setFieldErrors({});
      setGeneralError('');

      // Smooth scroll to top of form/receipt
      const formElem = document.getElementById('registration');
      if (formElem) {
        formElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      return true;
    } catch (err) {
      // Fallback for purely offline demo environments
      if (clientValidation.cleanedData) {
        const fallbackRecord: StudentRecord = {
          id: `${Date.now()}`,
          ...clientValidation.cleanedData,
          created: new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        };
        setRecords((prev) => [fallbackRecord, ...prev].slice(0, 30));
        setLastSubmitted(fallbackRecord);
        setFieldErrors({});
        return true;
      }

      setGeneralError('An unexpected network error occurred.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      window.alert('There are no candidate admissions to export in this session yet.');
      return;
    }

    const headers = ['Candidate Name', 'VTU USN', 'Branch / Program', 'Age Status', 'Residential Address', 'Enrolled Date'];
    const rows = records.map((record) => [
      record.name,
      record.usn,
      record.course,
      `${record.age} Yrs (${record.age < 18 ? 'Minor' : 'Adult'})`,
      record.address || '',
      record.created,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\r\n');

    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'KLEIT-Admissions-Roster-2026-27.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCount = records.length;
  const adultsCount = records.filter((r) => r.age >= 18).length;
  const minorsCount = records.filter((r) => r.age < 18).length;

  return (
    <div className="app-shell">
      {/* Institutional Top Ticker */}
      <div className="notice-ticker">
        <div className="notice-ticker-left">
          <span className="ticker-tag">Notice</span>
          <span className="ticker-text">
            VTU Admissions for B.E. / M.Tech / MCA (Academic Year 2026–27) are open. Ensure USN adheres to College Code 2KE.
          </span>
        </div>
        <div className="notice-ticker-right">
          <div className="ticker-contact">
            <span>📞 Helpline:</span>
            <a href="tel:+918362232664">+91 836 2232664</a>
          </div>
          <div className="ticker-contact">
            <span>✉ Email:</span>
            <a href="mailto:admissions@kleit.ac.in">admissions@kleit.ac.in</a>
          </div>
        </div>
      </div>

      {/* Official College Header Banner */}
      <header className="college-header-banner">
        <div className="banner-content">
          <div className="college-brand">
            <div className="emblem-wrap" aria-hidden="true">
              <svg className="emblem-svg" viewBox="0 0 48 48">
                {/* Academic Torch & Laurel Emblem */}
                <circle cx="24" cy="24" r="22" fill="#0c2340" />
                <circle cx="24" cy="24" r="19" fill="none" stroke="#d97706" strokeWidth="1.5" />
                <path d="M24 10 L28 17 L25.5 17 L27 25 L21 25 L22.5 17 L20 17 Z" fill="#f59e0b" />
                <path d="M19 25 L29 25 L27 34 L21 34 Z" fill="#cbd5e1" />
                <path d="M17 34 L31 34 L30 37 L18 37 Z" fill="#94a3b8" />
                <circle cx="24" cy="11" r="2.5" fill="#fde68a" />
              </svg>
            </div>
            <div className="college-titles">
              <span className="college-society">KLE Society&apos;s</span>
              <h1>K.L.E. Institute of Technology, Hubballi</h1>
              <div className="college-affiliations">
                <span>Affiliated to VTU, Belagavi</span>
                <span className="affil-sep">·</span>
                <span>Approved by AICTE, New Delhi</span>
                <span className="affil-sep">·</span>
                <span>Recognized by Govt. of Karnataka</span>
                <span className="affil-sep">·</span>
                <span className="vtu-code-chip">VTU Code: 2KE</span>
              </div>
            </div>
          </div>

          <div className="header-badges">
            <div className="accred-badge">
              <strong>NAAC &apos;A&apos; GRADE</strong>
              <small>Accredited</small>
            </div>
            <div className="accred-badge">
              <strong>NBA ACCREDITED</strong>
              <small>Eligible Branches</small>
            </div>
            <div className="accred-badge">
              <strong>ESTD. 2008</strong>
              <small>Hubballi Campus</small>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="portal-container">
        {/* Navigation Sidebar */}
        <Sidebar
          recordsCount={totalCount}
          activeSection={activeSection}
          onNavigate={handleNavigate}
        />

        {/* Content Area */}
        <main id="main" className="main-content">
          <Topbar />

          <div className="page-wrap">
            {/* Header & Export Roster */}
            <section id="overview" className="page-heading">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line"></span> ADMISSIONS CELL · ACADEMIC SESSION 2026–27
                </div>
                <h1>Student Admission &amp; Enrollment Portal</h1>
                <p className="subtitle">
                  Enroll prospective undergraduate and postgraduate candidates into the official college registry.
                </p>
              </div>
              <div className="heading-actions">
                <button
                  id="export-button"
                  className="button button-light"
                  type="button"
                  onClick={handleExportCSV}
                  title="Download candidate roster as CSV"
                >
                  <span className="download-icon">↓</span> Export Roster (CSV)
                </button>
              </div>
            </section>

            {/* Statistics Grid */}
            <StatsGrid total={totalCount} adults={adultsCount} minors={minorsCount} />

            {/* Success Receipt Banner */}
            {lastSubmitted && <SuccessReceipt record={lastSubmitted} />}

            {/* General Alert */}
            {generalError && (
              <div className="server-alert" role="alert">
                {generalError}
              </div>
            )}

            {/* Form and Guide Section */}
            <div className="content-grid">
              <RegistrationForm
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                errors={fieldErrors}
                clearFieldError={clearFieldError}
              />
              <QuickGuide />
            </div>

            {/* Candidate Records Table */}
            <RecordsTable records={records} />
          </div>
        </main>
      </div>

      {/* Official Institutional Footer */}
      <footer className="portal-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-col-main">
              <h3>K.L.E. Institute of Technology</h3>
              <p>
                Established under the prestigious aegis of Karnatak Lingayat Education (KLE) Society, Belagavi (Estd. 1916).
                Providing world-class technical education, high-impact research, and industry-ready engineering graduates.
              </p>
              <p style={{ marginTop: '8px', color: '#94a3b8' }}>
                📍 Opposite Hubballi Airport, Gokul Road, Hubballi – 580030, Karnataka, India.
              </p>
            </div>

            <div className="footer-links-grid">
              <div>
                <strong>Admissions &amp; Academics</strong>
                <ul>
                  <li><a href="#overview">Undergraduate (B.E.)</a></li>
                  <li><a href="#overview">Postgraduate (M.Tech / MCA)</a></li>
                  <li><a href="#help">KEA / CET Counseling Info</a></li>
                  <li><a href="#help">Scholarships &amp; Fee Concessions</a></li>
                </ul>
              </div>
              <div>
                <strong>Affiliated Bodies</strong>
                <ul>
                  <li><a href="https://vtu.ac.in" target="_blank" rel="noreferrer">VTU Belagavi ↗</a></li>
                  <li><a href="https://www.aicte-india.org" target="_blank" rel="noreferrer">AICTE New Delhi ↗</a></li>
                  <li><a href="https://klesociety.org" target="_blank" rel="noreferrer">KLE Society Official ↗</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © 2026 K.L.E. Institute of Technology, Hubballi. All Rights Reserved. Admissions Workspace System.
            </span>
            <div className="footer-bottom-right">
              <span>VTU Institute Code: <strong>2KE</strong></span>
              <span>·</span>
              <span>IT &amp; Admissions Cell</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
