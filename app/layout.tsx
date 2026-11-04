import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'K.L.E. Institute of Technology · Student Admissions & Registration Portal',
  description:
    'Official candidate admissions and student enrollment registration portal for K.L.E. Institute of Technology (KLEIT), Hubballi. Affiliated to VTU, Belagavi and approved by AICTE.',
  keywords: [
    'KLE Institute of Technology',
    'KLEIT Hubballi',
    'Student Registration',
    'VTU Admissions',
    'Engineering Admissions Hubli',
  ],
};

export const viewport: Viewport = {
  themeColor: '#0c2340',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
