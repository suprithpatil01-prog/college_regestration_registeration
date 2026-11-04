'use client';

import React, { useState, useMemo } from 'react';
import { StudentRecord } from '@/lib/types';

interface RecordsTableProps {
  records: StudentRecord[];
}

export function RecordsTable({ records }: RecordsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.usn.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.course.toLowerCase().includes(q) ||
        (r.address && r.address.toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  return (
    <section id="registrations" className="panel records-panel">
      <div className="records-heading">
        <div>
          <div className="records-title-line">
            <span className="step-number">02</span>
            <h2>Registered Candidates Roster (AY 2026–27)</h2>
            <span className="count-badge">{records.length} Total</span>
          </div>
          <p>Enrolled candidates for the current admissions cycle. Searchable by candidate name, USN, branch, or address.</p>
        </div>
        <label className="search-box">
          <span>🔍</span>
          <input
            id="search-records"
            type="search"
            placeholder="Search candidate name, USN, or city..."
            aria-label="Search registrations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="table-wrap">
        <table id="records-table">
          <thead>
            <tr>
              <th>CANDIDATE DETAILS</th>
              <th>VTU USN</th>
              <th>ALLOTTED BRANCH</th>
              <th>ELIGIBILITY CATEGORY</th>
              <th>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={5}>
                  <div className="empty-state">
                    <span className="empty-icon">📁</span>
                    <strong>No Candidate Records Found</strong>
                    <small>Newly registered student records will appear in this roster.</small>
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={5}>
                  <div className="no-results">No candidate records match your search query.</div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => {
                const isMinor = record.age < 18;
                const initial = record.name ? record.name.charAt(0).toUpperCase() : '?';

                return (
                  <tr key={record.id || record.usn}>
                    <td>
                      <div className="student-cell">
                        <span className="student-initial">{initial}</span>
                        <div>
                          <span>{record.name}</span>
                          <small className="student-email">{record.email}</small>
                          {record.address && (
                            <small
                              style={{
                                display: 'block',
                                fontSize: '9px',
                                color: 'var(--text-muted)',
                                marginTop: '2px',
                                maxWidth: '240px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={record.address}
                            >
                              📍 {record.address}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="usn-pill">{record.usn}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--kle-navy)' }}>{record.course}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${isMinor ? 'minor' : 'adult'}`}>
                        {isMinor ? `${record.age} · Minor` : `${record.age} · Adult`}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{record.created}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
