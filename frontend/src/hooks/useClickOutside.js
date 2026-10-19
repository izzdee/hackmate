import { useEffect } from 'react';

// Calls onOutside when the user clicks outside `ref` or presses Escape (for dropdowns)
export default function useClickOutside(ref, onOutside, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    };
    const handleKey = (e) => e.key === 'Escape' && onOutside();
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onOutside, active]);
}
