'use client';

import React, { useState, useRef, useCallback } from 'react';
import { COURSES, FormErrors, StudentFormData } from '@/lib/types';
import { parseBirthDate, calculateAge, getNameError, getUsnError, getEmailError, getDobError } from '@/lib/validation';

interface RegistrationFormProps {
  onSubmit: (formData: StudentFormData) => Promise<boolean>;
  isSubmitting: boolean;
  errors: FormErrors;
  clearFieldError: (field: keyof FormErrors) => void;
}

const initialFormState: StudentFormData = {
  name: '',
  usn: '',
  email: '',
  phone: '',
  address: '',
  course: '',
  dob: '',
  age: '',
};

export function RegistrationForm({
  onSubmit,
  isSubmitting,
  errors,
  clearFieldError,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<StudentFormData>(initialFormState);
  const [ageStatus, setAgeStatus] = useState<'empty' | 'minor' | 'adult'>('empty');
  const [liveErrors, setLiveErrors] = useState<FormErrors>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const usnInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);
  const courseInputRef = useRef<HTMLSelectElement>(null);
  const dobInputRef = useRef<HTMLInputElement>(null);
  const ageInputRef = useRef<HTMLInputElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Enter key → move to next field
  const handleEnterKey = useCallback(
    (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLElement | null>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        nextRef.current?.focus();
      }
    },
    []
  );

  const updateAgeStatusFromValue = (ageVal: string) => {
    const ageNum = Number(ageVal.trim());
    if (!ageVal.trim() || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 100) {
      setAgeStatus('empty');
    } else if (ageNum < 18) {
      setAgeStatus('minor');
    } else {
      setAgeStatus('adult');
    }
  };

  const shownError = (field: keyof FormErrors) => errors[field] || liveErrors[field] || '';

  const checkLiveError = (field: keyof StudentFormData, value: string) => {
    if (field === 'name' && /\d/.test(value)) return getNameError(value);
    if (field === 'email') {
      const tld = value.includes('.') ? value.slice(value.lastIndexOf('.') + 1) : '';
      if (value.includes('@') && tld && /\d/.test(tld)) return getEmailError(value);
    }
    if (field === 'dob' && /^(30|31)\/02\/\d{4}$/.test(value.trim())) return getDobError(value);
    if (field === 'usn' && value.length === 10) return getUsnError(value);
    return undefined;
  };

  const handleBlur = (field: keyof StudentFormData) => {
    let message: string | undefined;
    if (field === 'name') message = getNameError(formData.name);
    else if (field === 'usn') message = getUsnError(formData.usn);
    else if (field === 'email') message = getEmailError(formData.email);
    else if (field === 'dob') message = getDobError(formData.dob);
    else return;

    setLiveErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    let processedValue = value;

    if (field === 'usn') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    clearFieldError(field);

    const liveMessage = checkLiveError(field, processedValue);
    setLiveErrors((prev) => {
      const next = { ...prev };
      if (liveMessage) next[field] = liveMessage;
      else delete next[field];
      return next;
    });

    if (field === 'age') {
      updateAgeStatusFromValue(processedValue);
    }

    if (field === 'dob') {
      const parsedDate = parseBirthDate(processedValue);
      if (parsedDate && !formData.age) {
        const calcAge = calculateAge(parsedDate);
        if (calcAge >= 1 && calcAge <= 100) {
          setFormData((prev) => ({ ...prev, dob: processedValue, age: String(calcAge) }));
          updateAgeStatusFromValue(String(calcAge));
          clearFieldError('age');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      setFormData(initialFormState);
      setAgeStatus('empty');
      setLiveErrors({});
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setAgeStatus('empty');
    setLiveErrors({});
    Object.keys(formData).forEach((k) => clearFieldError(k as keyof FormErrors));
  };

  return (
    <section id="registration" className="panel form-panel">
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <span className="step-number">01</span>
          <div>
            <h2>Candidate Enrollment &amp; Registration Form</h2>
            <p>Enter student personal, academic, address, and contact credentials for VTU enrollment.</p>
          </div>
        </div>
        <span className="required-note">
          <i>*</i> Mandatory fields
        </span>
      </div>

      <form id="registration-form" onSubmit={handleSubmit} onReset={handleReset} noValidate>
        <div className="form-grid">
          {/* Candidate Full Name */}
          <div className="field field-span-2">
            <label htmlFor="student-name">
              Candidate Full Name <span className="required-star">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="student-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="e.g. XYZ"
              maxLength={80}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              onKeyDown={(e) => handleEnterKey(e, usnInputRef)}
              aria-invalid={!!shownError('name')}
              aria-describedby="name-hint name-error"
              required
            />
            <div className="field-foot">
              <small id="name-hint">Letters only. A name such as suprit6gouda is not allowed.</small>
              <small id="name-error" className="field-error" role={shownError('name') ? 'alert' : undefined}>
                {shownError('name')}
              </small>
            </div>
          </div>

          {/* University Seat Number (USN) - blank placeholder as requested */}
          <div className="field">
            <label htmlFor="usn">
              VTU Seat Number (USN) <span className="required-star">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="prefix-icon">#</span>
              <input
                ref={usnInputRef}
                id="usn"
                name="usn"
                type="text"
                placeholder=""
                maxLength={10}
                autoCapitalize="characters"
                spellCheck={false}
                value={formData.usn}
                onChange={(e) => handleInputChange('usn', e.target.value)}
                onBlur={() => handleBlur('usn')}
                onKeyDown={(e) => handleEnterKey(e, emailInputRef)}
                aria-invalid={!!shownError('usn')}
                aria-describedby="usn-hint usn-error"
                required
              />
            </div>
            <div className="field-foot">
              <small id="usn-hint">Exactly 10 characters, format 2KE24CS164 only.</small>
              <small id="usn-error" className="field-error" role={shownError('usn') ? 'alert' : undefined}>
                {shownError('usn')}
              </small>
            </div>
          </div>

          {/* Candidate Email */}
          <div className="field">
            <label htmlFor="email">
              Candidate Official Email <span className="required-star">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="prefix-icon">@</span>
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="student@example.com"
                maxLength={254}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                onKeyDown={(e) => handleEnterKey(e, phoneInputRef)}
                aria-invalid={!!shownError('email')}
                aria-describedby="email-hint email-error"
                required
              />
            </div>
            <div className="field-foot">
              <small id="email-hint">Use a real ending such as .com. Endings like .co8 are rejected.</small>
              <small id="email-error" className="field-error" role={shownError('email') ? 'alert' : undefined}>
                {shownError('email')}
              </small>
            </div>
          </div>

          {/* Mobile Number - placeholder as '-' as requested */}
          <div className="field">
            <label htmlFor="phone">
              Primary Contact Number <span className="required-star">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="prefix-text">+91</span>
              <input
                ref={phoneInputRef}
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel-national"
                placeholder="-"
                maxLength={16}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onKeyDown={(e) => handleEnterKey(e, courseInputRef)}
                aria-invalid={!!errors.phone}
                aria-describedby="phone-hint phone-error"
                required
              />
            </div>
            <div className="field-foot">
              <small id="phone-hint">10-digit active Indian mobile number.</small>
              <small id="phone-error" className="field-error">
                {errors.phone || ''}
              </small>
            </div>
          </div>

          {/* Academic Branch / Program */}
          <div className="field">
            <label htmlFor="course">
              Academic Program / Branch <span className="required-star">*</span>
            </label>
            <div className="select-wrap">
              <select
                ref={courseInputRef}
                id="course"
                name="course"
                value={formData.course}
                onChange={(e) => handleInputChange('course', e.target.value)}
                onKeyDown={(e) => handleEnterKey(e, addressInputRef)}
                aria-invalid={!!errors.course}
                aria-describedby="course-error"
                required
              >
                <option value="">Select Allotted Branch</option>
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-foot">
              <small id="course-hint">Branch as per KEA / Allotment Order</small>
              <small id="course-error" className="field-error">
                {errors.course || ''}
              </small>
            </div>
          </div>

          {/* Residential / Permanent Address */}
          <div className="field field-span-2">
            <label htmlFor="address">
              Permanent / Residential Address <span className="required-star">*</span>
            </label>
            <textarea
              ref={addressInputRef}
              id="address"
              name="address"
              placeholder="Enter complete residential address, city, district, state & postal PIN code"
              rows={3}
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onKeyDown={(e) => {
                // Shift+Enter adds a newline; plain Enter moves to DOB field
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  dobInputRef.current?.focus();
                }
              }}
              aria-invalid={!!errors.address}
              aria-describedby="address-hint address-error"
              required
            />
            <div className="field-foot">
              <small id="address-hint">Door/House number, locality, city, district, and 6-digit PIN code.</small>
              <small id="address-error" className="field-error">
                {errors.address || ''}
              </small>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="field">
            <label htmlFor="dob">
              Date of Birth <span className="required-star">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="prefix-icon">▦</span>
              <input
                ref={dobInputRef}
                id="dob"
                name="dob"
                type="text"
                inputMode="numeric"
                autoComplete="bday"
                placeholder="DD/MM/YYYY"
                maxLength={10}
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                onBlur={() => handleBlur('dob')}
                onKeyDown={(e) => handleEnterKey(e, ageInputRef)}
                aria-invalid={!!shownError('dob')}
                aria-describedby="dob-hint dob-error"
                required
              />
            </div>
            <div className="field-foot">
              <small id="dob-hint">DD/MM/YYYY. 30 and 31 February are not allowed.</small>
              <small id="dob-error" className="field-error" role={shownError('dob') ? 'alert' : undefined}>
                {shownError('dob')}
              </small>
            </div>
          </div>

          {/* Candidate Age */}
          <div className="field">
            <label htmlFor="age">
              Calculated Age (Years) <span className="required-star">*</span>
            </label>
            <div className="input-with-suffix">
              <input
                ref={ageInputRef}
                id="age"
                name="age"
                type="number"
                inputMode="numeric"
                min="1"
                max="100"
                step="1"
                placeholder="e.g. 18"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                onKeyDown={(e) => handleEnterKey(e, submitBtnRef)}
                aria-invalid={!!errors.age}
                aria-describedby="age-hint age-error"
                required
              />
              <span className="suffix-text">years</span>
            </div>
            <div className="field-foot">
              <small id="age-hint">Must match calculated Date of Birth.</small>
              <small id="age-error" className="field-error">
                {errors.age || ''}
              </small>
            </div>
          </div>
        </div>

        {/* Dynamic Institutional Verification Status */}
        <div
          id="age-status"
          className={`age-status ${ageStatus !== 'empty' ? ageStatus : ''}`}
          aria-live="polite"
        >
          {ageStatus === 'empty' && (
            <>
              <span className="status-icon">i</span>
              <span>Specify candidate age or date of birth to check legal admission category.</span>
            </>
          )}
          {ageStatus === 'minor' && (
            <>
              <span className="status-icon">!</span>
              <span>
                <strong>Minor</strong> · Age {formData.age} is under 18. Parent / legal guardian consent is required.
              </span>
            </>
          )}
          {ageStatus === 'adult' && (
            <>
              <span className="status-icon">✓</span>
              <span>
                <strong>Adult Candidate Status</strong> · 18 years or older. Eligible for direct autonomous student undertaking.
              </span>
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button className="button button-primary" ref={submitBtnRef} type="submit" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Validating & Enrolling…' : 'Submit Provisional Enrollment'}</span>
            <span className="button-arrow">→</span>
          </button>
          <button className="button button-quiet" type="reset">
            Reset Form
          </button>
        </div>
      </form>
    </section>
  );
}
