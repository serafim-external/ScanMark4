import './Button.css';

const Button = ({ children, onClick, title, disabled = false }) => (
  <button
    className="icon-button"
    onClick={onClick}
    title={title}
    disabled={disabled}
  >
    {children}
  </button>
);

export default Button;
