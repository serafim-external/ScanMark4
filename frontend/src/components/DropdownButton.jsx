import { useState, useRef, useEffect } from 'react';
import './DropdownButton.css';

const DropdownButton = ({ icon, items, onItemClick, title = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item) => {
    onItemClick(item);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-button-container" ref={dropdownRef}>
      <button
        className="dropdown-button"
        onClick={handleButtonClick}
        title={title}
        aria-label={title}
        aria-expanded={isOpen}
      >
        {icon}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {items.map((item, index) => {
            // If item has category, render it as a category header
            if (item.category) {
              return (
                <div key={`category-${index}`} className="dropdown-category">
                  <div className="dropdown-category-header">{item.category}</div>
                  {item.presets?.map((preset, presetIndex) => (
                    <button
                      key={`${index}-${presetIndex}`}
                      className="dropdown-item"
                      onClick={() => handleItemClick(preset)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              );
            }

            // Otherwise render as a simple item
            return (
              <button
                key={index}
                className="dropdown-item"
                onClick={() => handleItemClick(item)}
              >
                {item.name || item}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
