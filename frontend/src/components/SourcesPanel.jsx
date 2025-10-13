import { useRef } from 'react';
import Button from './Button';
import { FolderIcon, ServerIcon } from './Icons';
import { wadouri } from '@cornerstonejs/dicom-image-loader';

const SourcesPanel = ({ onFilesLoaded }) => {
  const fileInputRef = useRef(null);

  const handleLocalFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log(`Selected ${files.length} file(s)`);

      const imageIds = [];
      Array.from(files).forEach((file, index) => {
        console.log(`File ${index + 1}:`, {
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          type: file.type || 'unknown'
        });

        // Создаем imageId для каждого файла
        const imageId = wadouri.fileManager.add(file);
        imageIds.push(imageId);
        console.log(`Generated imageId: ${imageId}`);
      });

      console.log('Total imageIds:', imageIds);

      // Передаем imageIds наверх
      if (onFilesLoaded) {
        onFilesLoaded(imageIds);
      }
    }
  };

  return (
    <div className="sources-panel">
      <div className="sources-panel-buttons">
        <Button title="Local Files" onClick={handleLocalFilesClick}>
          <FolderIcon />
        </Button>
        <Button title="PACS">
          <ServerIcon />
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default SourcesPanel;
