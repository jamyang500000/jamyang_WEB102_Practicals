import { useEffect, useRef } from 'react';

export default function useIntersectionObserver(callback, options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback();
    }, options);

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [callback, options]);

  return ref;
}