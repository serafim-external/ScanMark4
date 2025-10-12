import Button from './Button';
import { FolderIcon, ServerIcon } from './Icons';

const SourcesPanel = () => {
  return (
    <div className="sources-panel">
      <div className="sources-panel-buttons">
        <Button title="Local Files">
          <FolderIcon size={20} />
        </Button>
        <Button title="PACS">
          <ServerIcon size={20} />
        </Button>
      </div>
    </div>
  );
};

export default SourcesPanel;
