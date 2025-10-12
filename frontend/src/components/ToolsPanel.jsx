import Button from './Button';
import { LayoutIcon, ZoomIcon } from './Icons';

const ToolsPanel = () => {
  return (
    <div className="tools-panel">
      <div className="tools-panel-buttons">
        <Button title="Layout">
          <LayoutIcon size={20} />
        </Button>
        <Button title="Zoom">
          <ZoomIcon size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ToolsPanel;
