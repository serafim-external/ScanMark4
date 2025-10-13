const Button = ({ children, onClick, title, disabled = false }) => {
  const style = {
    width: '25px',
    height: '25px',
    padding: 0,
    backgroundColor: disabled ? 'var(--border-muted)' : 'transparent',
    color: disabled ? 'var(--text-muted)' : 'var(--primary)',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    overflow: 'hidden'
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1.15)';
      e.currentTarget.style.backgroundColor = 'var(--bg)';
      e.currentTarget.style.boxShadow = '0 0 0 2px var(--primary)33';
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  const handleMouseDown = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1.05)';
    }
  };

  const handleMouseUp = (e) => {
    if (!disabled) {
      e.currentTarget.style.transform = 'scale(1.15)';
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
