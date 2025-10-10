import { useState } from 'react';
import Button from './Button';

const PacsModal = ({ isOpen, onClose }) => {
  const [isInputFocused, setIsInputFocused] = useState({});

  if (!isOpen) return null;

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: `1px solid ${isInputFocused[fieldName] ? '#3b82f6' : '#4a4a4a'}`,
    borderRadius: '6px',
    backgroundColor: '#252525',
    color: '#d4d4d4',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    boxShadow: isInputFocused[fieldName]
      ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
      : 'none'
  });

  const handleFocus = (field) => {
    setIsInputFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsInputFocused(prev => ({ ...prev, [field]: false }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#2d2d2d',
        padding: '32px',
        borderRadius: '12px',
        color: '#d4d4d4',
        minWidth: '450px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        border: '1px solid #4a4a4a'
      }}>
        <h3 style={{
          color: '#d4d4d4',
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🌐 PACS Connection
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: '#a0a0a0'
          }}>
            Server URL:
          </label>
          <input
            type="text"
            placeholder="http://example.com"
            style={inputStyle('serverUrl')}
            onFocus={() => handleFocus('serverUrl')}
            onBlur={() => handleBlur('serverUrl')}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: '#a0a0a0'
          }}>
            Port:
          </label>
          <input
            type="text"
            placeholder="11112"
            style={inputStyle('port')}
            onFocus={() => handleFocus('port')}
            onBlur={() => handleBlur('port')}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: '#a0a0a0'
          }}>
            AE Title:
          </label>
          <input
            type="text"
            placeholder="VIEWER"
            style={inputStyle('aeTitle')}
            onFocus={() => handleFocus('aeTitle')}
            onBlur={() => handleBlur('aeTitle')}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary">
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PacsModal;
