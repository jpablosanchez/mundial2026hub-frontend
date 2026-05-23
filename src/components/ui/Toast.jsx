import React, { useEffect } from 'react';
import Icon from './Icon';

const Toast = ({ msg, message, onDone, onClose, duration = 2800 }) => {
  const text = msg ?? message;
  const close = onDone || onClose;

  useEffect(() => {
    if (!close) return undefined;
    const t = setTimeout(close, duration);
    return () => clearTimeout(t);
  }, [text, close, duration]);

  if (!text) return null;
  return <div className="toast"><Icon name="check" size={14} /> {text}</div>;
};

export default Toast;
