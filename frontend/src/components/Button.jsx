import { useState } from 'react';

const Button = ({
  children,
  onClick,
  variant = 'default',
  title,
  style = {},
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    padding: variant === 'tool' ? '0' : '10px 16px',
    backgroundColor: isHovered ? '#3b82f6' : '#3a3a3a',
    color: isHovered ? '#ffffff' : '#d4d4d4',
    border: `1px solid ${isHovered ? '#3b82f6' : '#4a4a4a'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: isHovered
      ? '0 4px 8px rgba(59, 130, 246, 0.4)'
      : '0 2px 4px rgba(0,0,0,0.2)',
    transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
    ...(variant === 'tool' && {
      width: '46px',
      height: '46px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    ...(variant === 'source' && {
      height: '46px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1
    }),
    ...(variant === 'primary' && {
      backgroundColor: isHovered ? '#2563eb' : '#3b82f6',
      borderColor: isHovered ? '#2563eb' : '#3b82f6',
      color: '#ffffff'
    }),
    ...style
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={className}
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};

export default Button;
