import './globals.css';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LayoutWrapper from './components/LayoutWrapper';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'One Learn - Free Certified Learning',
  description: '100% Free, AI-Powered Learning Platform with Verified Certificates',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
