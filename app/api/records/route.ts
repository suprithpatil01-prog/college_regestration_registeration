import { NextResponse } from 'next/server';
import { validateStudentForm } from '@/lib/validation';
import { StudentFormData, StudentRecord } from '@/lib/types';

// In-memory records store for the server session (matching PHP session behaviour)
let serverRecords: StudentRecord[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    records: serverRecords,
    stats: {
      total: serverRecords.length,
      adults: serverRecords.filter((r) => r.age >= 18).length,
      minors: serverRecords.filter((r) => r.age < 18).length,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StudentFormData;
    const { isValid, errors, cleanedData } = validateStudentForm(body, serverRecords);

    if (!isValid || !cleanedData) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 422 }
      );
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newRecord: StudentRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...cleanedData,
      created: formattedDate,
    };

    // Prepend new record and keep up to 20 (matching original PHP logic)
    serverRecords = [newRecord, ...serverRecords].slice(0, 20);

    return NextResponse.json({
      success: true,
      record: newRecord,
      records: serverRecords,
      stats: {
        total: serverRecords.length,
        adults: serverRecords.filter((r) => r.age >= 18).length,
        minors: serverRecords.filter((r) => r.age < 18).length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        errors: { general: 'Failed to process student registration.' },
      },
      { status: 500 }
    );
  }
}

