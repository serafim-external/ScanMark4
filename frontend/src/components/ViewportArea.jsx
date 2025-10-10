const ViewportArea = ({ activeViewport, onViewportClick }) => {
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
          isActive={activeViewport === vpNum}
          onClick={() => onViewportClick(vpNum)}
        />
      ))}
    </div>
  );
};

const Viewport = ({ isActive, onClick }) => {
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#000',
        border: isActive ? '2px solid #3b82f6' : '1px solid #1e1e1e',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {/* Контейнер для Cornerstone viewport - будет использован позже */}
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000'
      }} />
    </div>
  );
};

export default ViewportArea;
