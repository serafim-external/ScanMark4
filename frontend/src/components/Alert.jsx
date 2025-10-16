import { useEffect, useState } from 'react';
import './Alert.css';

const Alert = ({
  variant = 'info', // 'danger', 'warning', 'success', 'info'
  title,
  message,
  onClose,
  autoClose = false,
  autoCloseDuration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      // Delay calling onClose to allow animation to complete
      setTimeout(() => onClose(), 200);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`alert alert-${variant}`}>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        {message && <div className="alert-message">{message}</div>}
      </div>
      <button
        className="alert-close-button"
        onClick={handleClose}
        aria-label="Close alert"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L11 11M11 1L1 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default Alert;
