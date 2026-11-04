export interface StudentRecord {
  id: string;
  name: string;
  usn: string;
  email: string;
  phone: string;
  address: string;
  course: string;
  dob: string;
  age: number;
  created: string;
}

export interface StudentFormData {
  name: string;
  usn: string;
  email: string;
  phone: string;
  address: string;
  course: string;
  dob: string;
  age: string;
}

export interface FormErrors {
  name?: string;
  usn?: string;
  email?: string;
  phone?: string;
  address?: string;
  course?: string;
  dob?: string;
  age?: string;
  general?: string;
}

export const COURSES = [
  'Computer Science & Engineering',
  'Information Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Master of Computer Applications (MCA)',
  'Business Administration',
  'Commerce',
  'Other',
] as const;
