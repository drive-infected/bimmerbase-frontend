import './globals.css';

export const metadata = {
  title: 'BimmerBase',
  description: 'BMW knowledge base',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}