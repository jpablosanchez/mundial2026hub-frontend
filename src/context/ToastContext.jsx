import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [msg, setMsg] = useState(null);
  const tokenRef = useRef(0);

  const showToast = useCallback((m) => {
    if (m === null || m === undefined || m === '') return;
    tokenRef.current += 1;
    setMsg(String(m));
  }, []);

  const clear = useCallback(() => setMsg(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {msg && <Toast key={tokenRef.current} msg={msg} onDone={clear} />}
    </ToastContext.Provider>
  );
};

export default ToastContext;
