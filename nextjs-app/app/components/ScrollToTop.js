'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/link';

const ScrollToTop = () => {
    const { pathname } = usePathname();

    // Use useLayoutEffect for immediate scroll before paint
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [pathname]);

    // Backup: Ensure scroll happens even if layout shifts occur
    useEffect(() => {
        const scrollToTop = () => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        scrollToTop();

        const timeoutId = setTimeout(scrollToTop, 100);

        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
