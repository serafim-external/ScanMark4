import Button from './Button';

const PacsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #4a4a4a',
    borderRadius: '6px',
    backgroundColor: '#252525',
    color: '#d4d4d4',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    color: '#a0a0a0'
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
        {/* Заголовок */}
        <h3 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🌐 PACS Connection
        </h3>

        {/* Поле Server URL */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Server URL:</label>
          <input type="text" placeholder="http://example.com" style={inputStyle} />
        </div>

        {/* Поле Port */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Port:</label>
          <input type="text" placeholder="11112" style={inputStyle} />
        </div>

        {/* Поле AE Title */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>AE Title:</label>
          <input type="text" placeholder="VIEWER" style={inputStyle} />
        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary">Connect</Button>
        </div>
      </div>
    </div>
  );
};

export default PacsModal;
