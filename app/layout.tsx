import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PayLink - بوابة دفع المستقلين البديلة',
  description: 'استقبل أموالك بالفيزا والماستركارد من عملائك الأجانب حول العالم وسحبها محلياً',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}
