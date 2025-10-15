import './Button.css';

const Button = ({ children, onClick, title, disabled = false, active = false }) => (
  <button
    className={`icon-button ${active ? 'active' : ''}`}
    onClick={onClick}
    title={title}
    disabled={disabled}
  >
    {children}
  </button>
);

export default Button;
