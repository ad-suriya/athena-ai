import { useEffect, useState } from 'react';

// Tracks whether a scrollable element is scrolled past half its height,
// and scrolls it smoothly to the top or bottom.
export const useScrollContainer = (ref) => {
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = element;
      setIsScrolledDown(scrollTop > clientHeight * 0.5);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [ref]);

  const scrollToTop = () => {
    ref.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  };

  return { isScrolledDown, scrollToTop, scrollToBottom };
};
