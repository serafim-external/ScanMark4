import Button from './Button';
import { LayoutIcon, ZoomIcon } from './Icons';

const ToolsPanel = () => {
  const tools = [
    { label: 'Layout', shortcut: '11', icon: <LayoutIcon size={20} /> },
    { label: 'Zoom', shortcut: '21', icon: <ZoomIcon size={20} /> }
  ];

  return (
    <div className="tools-panel">
      <div className="tools-panel-buttons">
        {tools.map(tool => (
          <Button
            key={tool.shortcut}
            variant="tool"
            title={`${tool.label} - Press ${tool.shortcut[0]}-${tool.shortcut[1]} (${tool.shortcut})`}
          >
            {tool.icon}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ToolsPanel;
