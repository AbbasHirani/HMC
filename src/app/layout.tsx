import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hirani Marketing Combines — Pumps, Water Systems & Industrial Supply',
  description: "Chennai's trusted supplier of water pumps, RO & filtration, fountains, pressure washers and hydraulic equipment. Workshop repair & servicing at Parrys.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-mark.png" />
        <link rel="apple-touch-icon" href="/logo-mark.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
