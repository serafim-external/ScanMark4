const Button = ({ children, onClick, variant = 'default', title }) => {
  const baseStyle = {
    backgroundColor: '#3C3C3C',
    color: '#ffffff',
    border: '1px solid #454545',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'background-color 0.15s ease'
  };

  const variants = {
    tool: {
      width: '42px',
      height: '42px',
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    primary: {
      padding: '6px 12px'
    }
  };

  const buttonStyle = { ...baseStyle, ...variants[variant] };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = '#8E4A49';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = '#3C3C3C';
  };

  return (
    <button
      onClick={onClick}
      title={title}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

export default Button;
