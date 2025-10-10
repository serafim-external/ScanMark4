import { useState } from 'react';

const ViewportArea = ({ viewportRefs, activeViewport, onViewportClick }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: '2px',
      height: '100%',
      backgroundColor: 'transparent'
    }}>
      {[1, 2, 3, 4].map(vpNum => (
        <Viewport
          key={vpNum}
          vpNum={vpNum}
          viewportRef={viewportRefs[`viewport${vpNum}`]}
          isActive={activeViewport === vpNum}
          onClick={() => onViewportClick(vpNum)}
        />
      ))}
    </div>
  );
};

const Viewport = ({ vpNum, viewportRef, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#000000',
        border: isActive ? '2px solid #3b82f6' : '1px solid #1e1e1e',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: isActive
          ? '0 0 12px rgba(59, 130, 246, 0.4)'
          : (isHovered ? '0 0 8px rgba(59, 130, 246, 0.2)' : '0 1px 4px rgba(0,0,0,0.3)'),
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        borderColor: isHovered && !isActive ? '#3b82f6' : (isActive ? '#3b82f6' : '#1e1e1e')
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={viewportRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000'
        }}
      />
    </div>
  );
};

export default ViewportArea;
