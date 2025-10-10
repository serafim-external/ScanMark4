import Button from './Button';

const ToolsPanel = ({ displaySequence }) => {
  const tools = [
    { label: 'Layout', shortcut: '11' },
    { label: 'Stack', shortcut: '12' },
    { label: 'Zoom', shortcut: '21' },
    { label: 'W/L', shortcut: '22' },
    { label: 'Length', shortcut: '31' },
    { label: 'Angle', shortcut: '32' },
    { label: 'Reset', shortcut: '41' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      position: 'relative'
    }}>
      {tools.map(tool => (
        <Button
          key={tool.shortcut}
          variant="tool"
          title={`Press ${tool.shortcut[0]}-${tool.shortcut[1]} (${tool.shortcut})`}
        >
          {tool.label}
        </Button>
      ))}

      {displaySequence && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          border: '1px solid #60a5fa'
        }}>
          {displaySequence}
        </div>
      )}
    </div>
  );
};

export default ToolsPanel;
