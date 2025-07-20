import React, { useEffect, useRef, useState } from 'react';

import {
  RenderingEngine,
  Enums as csEnums,
  init as cornerstoneCoreInit,
} from '@cornerstonejs/core';

import {
  ToolGroupManager,
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollTool,
  Enums as csToolsEnums,
  addTool,
  init as cornerstoneToolsInit,
} from '@cornerstonejs/tools';

import {
  init as dicomImageLoaderInit,
} from '@cornerstonejs/dicom-image-loader';

import {
  utilities,
  metaData,
  imageLoader,
} from '@cornerstonejs/core';

function App() {
  const viewportRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const [viewport, setViewport] = useState(null);
  const [status, setStatus] = useState('Готов к загрузке');
  const [isInitialized, setIsInitialized] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [imageStack, setImageStack] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [seriesInfo, setSeriesInfo] = useState(null);

  useEffect(() => {
    if (isInitialized) return;

    const initCornerstone = async () => {
      try {
        // Инициализация Cornerstone.js
        await cornerstoneCoreInit();
        
        dicomImageLoaderInit({
          useWebWorkers: false,
        });

        await cornerstoneToolsInit();

        // Регистрация инструментов
        addTool(WindowLevelTool);
        addTool(PanTool);  
        addTool(ZoomTool);
        addTool(StackScrollTool);

        // Создание rendering engine
        const renderingEngine = new RenderingEngine('myRenderingEngine');
        renderingEngineRef.current = renderingEngine;

        // Настройка viewport
        const viewportId = 'CT_STACK';
        const viewportInput = {
          viewportId,
          element: viewportRef.current,
          type: csEnums.ViewportType.STACK,
        };

        renderingEngine.enableElement(viewportInput);

        // Создание группы инструментов
        let toolGroup;
        try {
          toolGroup = ToolGroupManager.getToolGroup('myToolGroup');
          if (!toolGroup) {
            toolGroup = ToolGroupManager.createToolGroup('myToolGroup');
          }
        } catch (error) {
          toolGroup = ToolGroupManager.createToolGroup('myToolGroup');
        }
        
        if (toolGroup) {
          // Добавление инструментов
          toolGroup.addTool(WindowLevelTool.toolName);
          toolGroup.addTool(PanTool.toolName);
          toolGroup.addTool(ZoomTool.toolName);
          toolGroup.addTool(StackScrollTool.toolName);

          // Настройка привязок мыши
          toolGroup.setToolActive(WindowLevelTool.toolName, {
            bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
          });

          toolGroup.setToolActive(PanTool.toolName, {
            bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
          });

          toolGroup.setToolActive(ZoomTool.toolName, {
            bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
          });

          toolGroup.setToolActive(StackScrollTool.toolName, {
            bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
          });

          toolGroup.addViewport(viewportId, 'myRenderingEngine');
        }

        const stackViewport = renderingEngine.getViewport(viewportId);
        setViewport(stackViewport);
        setIsInitialized(true);

      } catch (error) {
        console.error('Ошибка инициализации:', error);
        setStatus('Ошибка инициализации');
      }
    };

    initCornerstone();

    return () => {
      // Cleanup будет выполнен в отдельном useEffect
    };
  }, [isInitialized]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.destroy();
        } catch (error) {
          // Engine уже уничтожен
        }
      }
    };
  }, []);

  // Обработка клавиатурных команд
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (imageStack.length > 1) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            nextImage();
            break;
          case 'ArrowDown':
            event.preventDefault();
            prevImage();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageStack.length, currentImageIndex]);

  // Функция сортировки по Instance Number
  const sortByInstanceNumber = async (imageIds) => {
    const imageWithMetadata = [];
    
    for (const imageId of imageIds) {
      try {
        const generalImageModule = metaData.get('generalImageModule', imageId);
        const instanceNumber = generalImageModule?.instanceNumber || 0;
        imageWithMetadata.push({ imageId, instanceNumber });
        console.log(`Image: ${imageId}, Instance Number: ${instanceNumber}`);
      } catch (error) {
        console.warn(`Не удалось получить метаданные для ${imageId}:`, error);
        imageWithMetadata.push({ imageId, instanceNumber: 0 });
      }
    }
    
    imageWithMetadata.sort((a, b) => a.instanceNumber - b.instanceNumber);
    return imageWithMetadata.map(item => item.imageId);
  };

  // Функция сортировки по Slice Location
  const sortBySliceLocation = async (imageIds) => {
    const imageWithMetadata = [];
    
    for (const imageId of imageIds) {
      try {
        const imagePlaneModule = metaData.get('imagePlaneModule', imageId);
        const sliceLocation = imagePlaneModule?.sliceLocation || 0;
        imageWithMetadata.push({ imageId, sliceLocation });
        console.log(`Image: ${imageId}, Slice Location: ${sliceLocation}`);
      } catch (error) {
        console.warn(`Не удалось получить метаданные для ${imageId}:`, error);
        imageWithMetadata.push({ imageId, sliceLocation: 0 });
      }
    }
    
    imageWithMetadata.sort((a, b) => a.sliceLocation - b.sliceLocation);
    return imageWithMetadata.map(item => item.imageId);
  };

  // Функция сортировки по Image Position Patient
  const sortByImagePositionPatient = async (imageIds) => {
    const imageWithMetadata = [];
    
    for (const imageId of imageIds) {
      try {
        const imagePlaneModule = metaData.get('imagePlaneModule', imageId);
        const imagePositionPatient = imagePlaneModule?.imagePositionPatient;
        const imageOrientationPatient = imagePlaneModule?.imageOrientationPatient;
        
        if (imagePositionPatient && imagePositionPatient.length >= 3) {
          imageWithMetadata.push({ 
            imageId, 
            position: imagePositionPatient,
            orientation: imageOrientationPatient,
            x: imagePositionPatient[0],
            y: imagePositionPatient[1], 
            z: imagePositionPatient[2]
          });
          console.log(`Image: ${imageId}, Position: [${imagePositionPatient.join(', ')}]`);
        } else {
          imageWithMetadata.push({ imageId, position: [0, 0, 0], orientation: null, x: 0, y: 0, z: 0 });
        }
      } catch (error) {
        console.warn(`Не удалось получить метаданные для ${imageId}:`, error);
        imageWithMetadata.push({ imageId, position: [0, 0, 0], orientation: null, x: 0, y: 0, z: 0 });
      }
    }
    
    if (imageWithMetadata.length >= 2) {
      // Определяем основное направление изменения координат
      const positions = imageWithMetadata.map(item => item.position);
      const xRange = Math.max(...positions.map(p => p[0])) - Math.min(...positions.map(p => p[0]));
      const yRange = Math.max(...positions.map(p => p[1])) - Math.min(...positions.map(p => p[1]));
      const zRange = Math.max(...positions.map(p => p[2])) - Math.min(...positions.map(p => p[2]));
      
      console.log(`Диапазоны координат - X: ${xRange.toFixed(2)}, Y: ${yRange.toFixed(2)}, Z: ${zRange.toFixed(2)}`);
      
      // Сортируем по оси с наибольшим изменением
      if (zRange >= xRange && zRange >= yRange) {
        console.log('Сортировка по Z-координате (аксиальные срезы)');
        imageWithMetadata.sort((a, b) => a.z - b.z);
      } else if (yRange >= xRange) {
        console.log('Сортировка по Y-координате (коронарные срезы)');
        imageWithMetadata.sort((a, b) => a.y - b.y);
      } else {
        console.log('Сортировка по X-координате (сагиттальные срезы)');
        imageWithMetadata.sort((a, b) => a.x - b.x);
      }
    }
    
    return imageWithMetadata.map(item => item.imageId);
  };

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    setStatus(`Загружаем ${files.length} файл(ов)...`);
    
    try {
      const filesWithMetadata = [];
      
      // Сначала загружаем все файлы и получаем их метаданные
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatus(`Обрабатываем файл ${i + 1}/${files.length}: ${file.name}...`);
        
        const arrayBuffer = await file.arrayBuffer();
        const dicomData = new Uint8Array(arrayBuffer);
        const blob = new Blob([dicomData], { type: 'application/dicom' });
        const url = URL.createObjectURL(blob);
        const imageId = `wadouri:${url}`;
        
        // Предзагружаем изображение для получения метаданных
        try {
          await imageLoader.loadAndCacheImage(imageId);
        } catch (loadError) {
          console.warn(`Ошибка загрузки изображения ${file.name}:`, loadError);
        }
        
        filesWithMetadata.push({
          imageId,
          fileName: file.name,
          file
        });
      }
      
      setStatus('Сортируем серию по метаданным...');
      
      // Теперь пробуем сортировку с загруженными метаданными
      let sortedImageIds = filesWithMetadata.map(f => f.imageId);
      
      if (filesWithMetadata.length > 1) {
        let sortingSuccess = false;
        
        // Попытка 1: Сортировка по Image Position Patient
        try {
          console.log('Пробуем сортировку по Image Position Patient...');
          sortedImageIds = await sortByImagePositionPatient(sortedImageIds);
          console.log('Image Position Patient сортировка завершена');
          sortingSuccess = true;
        } catch (positionError) {
          console.warn('Image Position Patient сортировка не удалась:', positionError);
        }
        
        // Попытка 2: Cornerstone сортировка
        if (!sortingSuccess) {
          try {
            console.log('Пробуем Cornerstone сортировку с предзагруженными метаданными...');
            const sortingResult = utilities.sortImageIdsAndGetSpacing(sortedImageIds);
            sortedImageIds = sortingResult.sortedImageIds;
            console.log('Cornerstone сортировка успешна, z-spacing:', sortingResult.zSpacing);
            sortingSuccess = true;
          } catch (error) {
            console.warn('Cornerstone сортировка не удалась:', error);
          }
        }
        
        // Попытка 3: Instance Number
        if (!sortingSuccess) {
          try {
            console.log('Пробуем сортировку по Instance Number...');
            sortedImageIds = await sortByInstanceNumber(sortedImageIds);
            console.log('Instance Number сортировка завершена');
            sortingSuccess = true;
          } catch (instanceError) {
            console.warn('Instance Number сортировка не удалась:', instanceError);
          }
        }
        
        // Попытка 4: Slice Location
        if (!sortingSuccess) {
          try {
            console.log('Пробуем сортировку по Slice Location...');
            sortedImageIds = await sortBySliceLocation(sortedImageIds);
            console.log('Slice Location сортировка завершена');
            sortingSuccess = true;
          } catch (sliceError) {
            console.warn('Slice Location сортировка не удалась:', sliceError);
          }
        }
        
        // Последняя попытка: сортировка по именам файлов
        if (!sortingSuccess) {
          try {
            console.log('Сортируем по именам файлов...');
            filesWithMetadata.sort((a, b) => a.fileName.localeCompare(b.fileName));
            sortedImageIds = filesWithMetadata.map(f => f.imageId);
            console.log('Сортировка по именам файлов завершена');
          } catch (nameError) {
            console.warn('Все методы сортировки не удались, используем исходный порядок');
          }
        }
      }
      
      setImageStack(sortedImageIds);
      setCurrentImageIndex(0);
      setSeriesInfo({
        totalImages: sortedImageIds.length,
        currentImage: 1
      });
      
      if (viewport && sortedImageIds.length > 0) {
        setStatus('Отображаем серию...');
        
        try {
          await viewport.setStack(sortedImageIds);
          
          setTimeout(() => {
            try {
              if (renderingEngineRef.current) {
                renderingEngineRef.current.renderViewports(['CT_STACK']);
                setStatus(`Загружена серия: ${sortedImageIds.length} изображений`);
              } else {
                setStatus('Ошибка: Rendering engine не найден');
              }
            } catch (renderError) {
              setStatus(`Ошибка рендеринга: ${renderError.message}`);
            }
          }, 100);
          
        } catch (stackError) {
          setStatus(`Ошибка загрузки: ${stackError.message}`);
        }
      } else {
        setStatus('Ошибка: Viewport не готов');
      }
    } catch (error) {
      setStatus(`Ошибка: ${error.message}`);
    }
  };

  const handleFileLoad = async (event) => {
    const files = Array.from(event.target.files);
    await processFiles(files);
  };

  const handleFolderLoad = async (event) => {
    const files = Array.from(event.target.files);
    await processFiles(files);
  };

  const showFileDialog = () => {
    fileInputRef.current?.click();
  };

  const showFolderDialog = () => {
    folderInputRef.current?.click();
  };


  const navigateToImage = (index) => {
    if (viewport && imageStack.length > 0 && index >= 0 && index < imageStack.length) {
      viewport.setImageIdIndex(index);
      setCurrentImageIndex(index);
      setSeriesInfo(prev => ({ ...prev, currentImage: index + 1 }));
      renderingEngineRef.current?.renderViewports(['CT_STACK']);
    }
  };

  const nextImage = () => {
    if (currentImageIndex < imageStack.length - 1) {
      navigateToImage(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      navigateToImage(currentImageIndex - 1);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>DICOM Viewer</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileLoad}
          style={{ display: 'none' }}
        />
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory="true"
          onChange={handleFolderLoad}
          style={{ display: 'none' }}
        />
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={showFileDialog}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Загрузить файл(ы)
          </button>
          
          <button 
            onClick={showFolderDialog}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Загрузить папку
          </button>
        </div>
        
        {seriesInfo && (
          <div style={{ 
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              Изображение {seriesInfo.currentImage} из {seriesInfo.totalImages}
            </span>
          </div>
        )}
        
        <div style={{ 
          marginTop: '10px', 
          fontWeight: 'bold', 
          color: status.includes('Ошибка') ? '#dc3545' : '#28a745' 
        }}>
          Статус: {status}
        </div>
        
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          fontSize: '14px', 
          color: '#666' 
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Управление:</div>
          <div>• Левая кнопка мыши: изменение яркости/контраста</div>
          <div>• Средняя кнопка мыши: панорамирование</div>
          <div>• Правая кнопка мыши: масштабирование</div>
          <div>• Колесо мыши: прокрутка слайсов (для стеков)</div>
          <div>• Клавиши ↑/↓: навигация по слайсам серии</div>
        </div>
      </div>
      
      <div
        ref={viewportRef}
        style={{
          width: '800px',
          height: '600px',
          border: '2px solid #ddd',
          borderRadius: '5px',
          backgroundColor: '#000',
        }}
      />
    </div>
  );
}

export default App;