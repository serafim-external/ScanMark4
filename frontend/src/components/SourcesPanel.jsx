import { useRef } from 'react';
import Button from './Button';

const SourcesPanel = ({ onLocalFiles, onPacs }) => {
  const fileInputRef = useRef(null);

  const handleLocalFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      width: '100%',
      height: '100%',
      alignItems: 'center'
    }}>
      <Button variant="source" onClick={handleLocalFiles}>
        📁 Local Files
      </Button>
      <Button variant="source" onClick={onPacs}>
        🌐 PACS
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        webkitdirectory="true"
        onChange={(e) => onLocalFiles(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default SourcesPanel;
