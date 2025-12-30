'use client';

'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/PageTransition.css';

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // Check if we should hide Navbar/Footer
    const isLoginPage = pathname === '/login';
    const isQuizPage = pathname?.includes('/quiz');
    const isAdminPage = pathname?.startsWith('/admin');

    const hideNavbar = isLoginPage || isQuizPage || isAdminPage;
    const hideFooter = isQuizPage || isAdminPage;

    return (
        <>
            {!hideNavbar && <Navbar />}
            <div className="page-wrapper">
                <div key={pathname} className="page-transition">
                    {children}
                </div>
            </div>
            {!hideFooter && <Footer />}
        </>
    );
}
