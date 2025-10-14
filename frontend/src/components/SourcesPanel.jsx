import { useRef } from 'react';
import Button from './Button';
import { FolderIcon, ServerIcon } from './Icons';
import { wadouri } from '@cornerstonejs/dicom-image-loader';
import { utilities, imageLoader } from '@cornerstonejs/core';

const SourcesPanel = ({ onFilesLoaded }) => {
  const fileInputRef = useRef(null);

  const handleLocalFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
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

      console.log('Total imageIds (unsorted):', imageIds);

      try {
        // Загружаем метаданные для всех изображений
        // Cornerstone автоматически кэширует метаданные при loadImage
        await Promise.all(imageIds.map(imageId => imageLoader.loadImage(imageId)));
        console.log('Metadata loaded for all images');

        // Теперь сортируем imageIds с помощью встроенной утилиты Cornerstone
        // Она использует загруженные DICOM метаданные
        const { sortedImageIds } = utilities.sortImageIdsAndGetSpacing(imageIds);
        console.log('Sorted imageIds:', sortedImageIds);

        // Передаем отсортированные imageIds наверх
        if (onFilesLoaded) {
          onFilesLoaded(sortedImageIds);
        }
      } catch (error) {
        console.error('Error loading or sorting imageIds:', error);
        // В случае ошибки передаем неотсортированные
        if (onFilesLoaded) {
          onFilesLoaded(imageIds);
        }
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
