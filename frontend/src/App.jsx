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

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    setStatus(`Загружаем ${files.length} файл(ов)...`);
    
    try {
      const imageIds = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatus(`Обрабатываем файл ${i + 1}/${files.length}: ${file.name}...`);
        
        const arrayBuffer = await file.arrayBuffer();
        const dicomData = new Uint8Array(arrayBuffer);
        const blob = new Blob([dicomData], { type: 'application/dicom' });
        const url = URL.createObjectURL(blob);
        const imageId = `wadouri:${url}`;
        
        imageIds.push(imageId);
      }
      
      // Сортируем изображения для правильного отображения серии
      let sortedImageIds = imageIds;
      if (imageIds.length > 1) {
        try {
          setStatus('Сортируем серию...');
          const sortingResult = utilities.sortImageIdsAndGetSpacing(imageIds);
          sortedImageIds = sortingResult.sortedImageIds;
          console.log('Серия отсортирована, z-spacing:', sortingResult.zSpacing);
        } catch (error) {
          console.warn('Не удалось отсортировать серию, используем исходный порядок:', error);
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