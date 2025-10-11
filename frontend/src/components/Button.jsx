const Button = ({ children, onClick, variant = 'default', title }) => {
  // Базовые стили для всех кнопок
  const base = {
    padding: '10px 16px',
    backgroundColor: '#3C3C3C',
    color: '#ffffff',
    border: '1px solid #454545',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  };

  // Варианты стилей для разных типов кнопок
  const variants = {
    tool: {
      width: '46px',
      height: '46px',
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    source: {
      height: '46px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1
    },
    primary: {
      backgroundColor: '#3C3C3C',
      borderColor: '#454545',
      color: '#ffffff'
    }
  };

  const buttonStyle = { ...base, ...variants[variant] };

  return (
    <button onClick={onClick} title={title} style={buttonStyle}>
      {children}
    </button>
  );
};

export default Button;
