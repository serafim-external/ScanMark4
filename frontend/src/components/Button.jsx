const Button = ({ children, onClick, variant = 'default', title }) => {
  const baseStyle = {
    backgroundColor: 'oklch(0.3 0 264)',
    color: 'oklch(0.96 0 264)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'background-color 0.15s ease'
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

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = 'oklch(0.35 0 264)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'oklch(0.3 0 264)';
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
