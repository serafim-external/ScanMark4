import Button from './Button';
import { LayoutIcon, ZoomIcon } from './Icons';

const ToolsPanel = () => (
  <div className="tools-panel">
    <div className="tools-panel-buttons">
      <Button title="Layout">
        <LayoutIcon />
      </Button>
      <Button title="Zoom">
        <ZoomIcon />
      </Button>
    </div>
  </div>
);

export default ToolsPanel;
