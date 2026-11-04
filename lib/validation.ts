import { COURSES, FormErrors, StudentFormData, StudentRecord } from './types';

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(month: number, year: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

export function getNameError(name: string): string | undefined {
  const cleanName = name.replace(/\s+/g, ' ').trim();
  if (!cleanName) return 'Enter the candidate’s full name.';
  if (/\d/.test(cleanName)) return 'Numbers are not allowed in the student name.';
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(cleanName)) {
    return 'Use letters only. Numbers are not allowed in the student name.';
  }
  return undefined;
}

export function getUsnError(usn: string, existingRecords: StudentRecord[] = []): string | undefined {
  const cleanUsn = usn.trim().toUpperCase();
  if (!/^\d[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/.test(cleanUsn)) {
    return 'USN must be exactly 10 characters in this format only, for example 2KE24CS164.';
  }
  if (existingRecords.some((rec) => rec.usn.toUpperCase() === cleanUsn)) {
    return 'This USN is already registered in this session.';
  }
  return undefined;
}

export function getEmailError(email: string): string | undefined {
  const cleanEmail = email.trim();
  const tld = cleanEmail.includes('.') ? cleanEmail.slice(cleanEmail.lastIndexOf('.') + 1) : '';
  const emailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,}$/i;
  if (!cleanEmail || !emailPattern.test(cleanEmail) || !/^[A-Za-z]{2,}$/.test(tld)) {
    if (tld && /\d/.test(tld)) {
      return `Enter a valid email address. ".${tld}" is not allowed. The ending must be letters only, such as .com.`;
    }
    return 'Enter a valid email address, such as name@gmail.com.';
  }
  return undefined;
}

export function getDobError(dobStr: string): string | undefined {
  const trimmed = dobStr.trim();
  if (!trimmed) return 'Enter the date of birth in DD/MM/YYYY format.';

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) return 'Enter a real date in DD/MM/YYYY format.';

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12) return 'Enter a real month from 01 to 12.';
  if (month === 2 && (day === 30 || day === 31)) {
    return 'February does not have 30 or 31 days.';
  }

  const maxDay = daysInMonth(month, year);
  if (day < 1 || day > maxDay) {
    if (month === 2 && day === 29) return '29 February is only valid in a leap year.';
    return 'That date does not exist. Check the day and month.';
  }
  if (year < 1900) return 'Enter a year from 1900 onward.';

  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return 'That date does not exist. Check the day and month.';
  }
  if (date > today) return 'Date of birth cannot be in the future.';
  return undefined;
}

export function parseBirthDate(dobStr: string): Date | null {
  if (getDobError(dobStr)) return null;

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dobStr.trim());
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

export function calculateAge(birthDate: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function cleanPhone(phone: string): string {
  let cleaned = phone.replace(/[\s()-]/g, '').trim();
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  }
  return cleaned;
}

export function validateStudentForm(
  data: StudentFormData,
  existingRecords: StudentRecord[] = []
): { isValid: boolean; errors: FormErrors; cleanedData: Omit<StudentRecord, 'id' | 'created'> | null } {
  const errors: FormErrors = {};

  // 1. Name validation — letters only; a digit such as suprit6gouda is rejected
  const cleanName = data.name.replace(/\s+/g, ' ').trim();
  const nameError = getNameError(data.name);
  if (nameError) errors.name = nameError;

  // 2. USN validation — exactly 10 characters: 2KE24CS164
  const cleanUsn = data.usn.trim().toUpperCase();
  const usnError = getUsnError(data.usn, existingRecords);
  if (usnError) errors.usn = usnError;

  // 3. Email validation — .co8 and any ending with a digit are rejected
  const cleanEmail = data.email.trim();
  const emailError = getEmailError(data.email);
  if (emailError) errors.email = emailError;

  // 4. Phone validation
  const phone = cleanPhone(data.phone);
  if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  }

  // 5. Address validation
  const cleanAddress = (data.address || '').replace(/\s+/g, ' ').trim();
  if (!cleanAddress) {
    errors.address = 'Enter the candidate’s residential / permanent address.';
  } else if (cleanAddress.length < 5) {
    errors.address = 'Address must be at least 5 characters long.';
  }

  // 6. Course validation
  if (!data.course || !COURSES.includes(data.course as any)) {
    errors.course = 'Select an allotted branch / program.';
  }

  // 7. Date of birth validation — 30/02 and 31/02 are rejected
  const dobError = getDobError(data.dob);
  const birthDate = dobError ? null : parseBirthDate(data.dob);
  if (dobError) errors.dob = dobError;

  // 8. Age validation
  const ageNum = Number(data.age.trim());
  if (!data.age.trim() || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 100) {
    errors.age = 'Enter a whole age from 1 to 100.';
  } else if (birthDate && calculateAge(birthDate) !== ageNum) {
    errors.age = 'Age does not match the date of birth.';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    cleanedData: isValid
      ? {
          name: cleanName,
          usn: cleanUsn,
          email: cleanEmail,
          phone,
          address: cleanAddress,
          course: data.course,
          dob: data.dob.trim(),
          age: ageNum,
        }
      : null,
  };
}
