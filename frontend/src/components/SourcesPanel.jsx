import Button from './Button';
import { FolderIcon, ServerIcon } from './Icons';

const SourcesPanel = () => {
  return (
    <div className="sources-panel">
      <Button variant="tool" title="Local Files">
        <FolderIcon size={18} />
      </Button>
      <Button variant="tool" title="PACS">
        <ServerIcon size={18} />
      </Button>
    </div>
  );
};

export default SourcesPanel;
