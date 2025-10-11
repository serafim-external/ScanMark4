const Button = ({ children, onClick, variant = 'default', title }) => {
  const baseStyle = {
    backgroundColor: '#3C3C3C',
    color: '#ffffff',
    border: '1px solid #454545',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit'
  };

  const variants = {
    tool: {
      width: '46px',
      height: '46px',
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    primary: {
      padding: '10px 16px'
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
