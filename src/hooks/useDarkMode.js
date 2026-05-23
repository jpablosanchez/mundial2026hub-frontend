import { useState, useEffect } from 'react';

const useDarkMode = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('darkMode', dark);
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  return { dark, toggleDark, setDark };
};

export default useDarkMode;
