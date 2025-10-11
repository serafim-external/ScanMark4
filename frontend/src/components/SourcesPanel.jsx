import Button from './Button';
import { FolderIcon, ServerIcon } from './Icons';

const SourcesPanel = () => {
  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      width: '100%',
      height: '100%',
      alignItems: 'center'
    }}>
      <Button variant="tool" title="Local Files">
        <FolderIcon size={20} />
      </Button>
      <Button variant="tool" title="PACS">
        <ServerIcon size={20} />
      </Button>
    </div>
  );
};

export default SourcesPanel;
