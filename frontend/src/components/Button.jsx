const Button = ({ children, onClick, variant = 'default', title }) => {
  const baseStyle = {
    backgroundColor: '#3C3C3C',
    color: '#ffffff',
    border: '1px solid #454545',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit'
  };

  const variants = {
    tool: {
      width: '36px',
      height: '36px',
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

  return (
    <button onClick={onClick} title={title} style={buttonStyle}>
      {children}
    </button>
  );
};

export default Button;
