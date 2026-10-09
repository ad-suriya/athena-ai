import { useEffect, useState } from 'react';

const MOBILE_MAX_WIDTH = 768;

// True while the window is narrower than 768px; updates on resize.
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_MAX_WIDTH);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_MAX_WIDTH);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};
