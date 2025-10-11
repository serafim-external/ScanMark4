import Button from './Button';

const ToolsPanel = () => {
  const tools = [
    { label: 'Layout', shortcut: '11' },
    { label: 'Zoom', shortcut: '21' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
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
    </div>
  );
};

export default ToolsPanel;
