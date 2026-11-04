import { COURSES, FormErrors, StudentFormData, StudentRecord } from './types';

export function parseBirthDate(dobStr: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dobStr.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (
    year < 1900 ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date > today
  ) {
    return null;
  }

  return date;
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

  // 1. Name validation
  const cleanName = data.name.replace(/\s+/g, ' ').trim();
  if (!cleanName) {
    errors.name = 'Enter the candidate’s full name.';
  } else if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(cleanName)) {
    errors.name = 'Use letters only; numbers are not allowed.';
  }

  // 2. USN validation
  const cleanUsn = data.usn.trim().toUpperCase();
  if (!/^\d[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/.test(cleanUsn)) {
    errors.usn = 'Enter a valid 10-character VTU USN.';
  } else if (existingRecords.some((rec) => rec.usn.toUpperCase() === cleanUsn)) {
    errors.usn = 'This USN is already registered in this session.';
  }

  // 3. Email validation
  const cleanEmail = data.email.trim();
  const emailPattern = /^[^@\s]+@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,}$/i;
  if (!cleanEmail || !emailPattern.test(cleanEmail)) {
    errors.email = 'Enter a valid email with an alphabetic ending, such as student@example.com.';
  }

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

  // 7. Date of birth validation
  const birthDate = parseBirthDate(data.dob);
  if (!birthDate) {
    errors.dob = 'Enter a real date in DD/MM/YYYY format; future dates are not allowed.';
  }

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
