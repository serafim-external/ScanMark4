import Button from './Button';
import { LayoutIcon, ZoomIcon, PanIcon, WindowLevelIcon, StackScrollIcon } from './Icons';

const ToolsPanel = () => (
  <div className="tools-panel">
    <div className="tools-panel-buttons">
      <Button title="Layout">
        <LayoutIcon />
      </Button>
      <Button title="Zoom">
        <ZoomIcon />
      </Button>
      <Button title="Pan">
        <PanIcon />
      </Button>
      <Button title="Window/Level">
        <WindowLevelIcon />
      </Button>
      <Button title="Stack Scroll">
        <StackScrollIcon />
      </Button>
    </div>
  </div>
);

export default ToolsPanel;
