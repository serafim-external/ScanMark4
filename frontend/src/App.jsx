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

function App() {
  const viewportRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const [viewport, setViewport] = useState(null);
  const [status, setStatus] = useState('Готов к загрузке');
  const [isInitialized, setIsInitialized] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileLoad = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setStatus(`Загружаем файл: ${file.name}...`);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const dicomData = new Uint8Array(arrayBuffer);
      
      setStatus('Обрабатываем DICOM данные...');
      
      const blob = new Blob([dicomData], { type: 'application/dicom' });
      const url = URL.createObjectURL(blob);
      const imageId = `wadouri:${url}`;
      
      if (viewport) {
        setStatus('Отображаем изображение...');
        
        try {
          await viewport.setStack([imageId]);
          
          // Асинхронный рендеринг
          setTimeout(() => {
            try {
              if (renderingEngineRef.current) {
                renderingEngineRef.current.renderViewports(['CT_STACK']);
                setStatus(`Файл загружен: ${file.name}`);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>DICOM Viewer</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileLoad}
          style={{ display: 'none' }}
        />
        <button 
          onClick={triggerFileInput}
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
          Загрузить DICOM файл
        </button>
        
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