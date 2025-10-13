import Button from './Button';
import { FolderIcon, ServerIcon } from './Icons';

const SourcesPanel = () => (
  <div className="sources-panel">
    <div className="sources-panel-buttons">
      <Button title="Local Files">
        <FolderIcon />
      </Button>
      <Button title="PACS">
        <ServerIcon />
      </Button>
    </div>
  </div>
);

export default SourcesPanel;
