import { useEffect, useRef } from 'react';
import { RenderingEngine, Enums as csEnums } from '@cornerstonejs/core';
import { registerTools, createToolGroup } from '../utils/setupTools';
import { useAlerts } from '../contexts/AlertContext';
import AlertContainer from './AlertContainer';
import { setAlertCallback, warnIfSigmoid } from '../utils/voiManager';

const ViewportArea = ({ imageIds }) => {
  const viewportRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const viewportIdRef = useRef('CT_STACK');
  const renderingEngineIdRef = useRef('myRenderingEngine');
  const { alerts, removeAlert, addAlert } = useAlerts();

  // Установка callback для VOI manager
  useEffect(() => {
    setAlertCallback(addAlert);
  }, [addAlert]);

  // Инициализация viewport
  useEffect(() => {
    if (!viewportRef.current) return;

    const renderingEngineId = renderingEngineIdRef.current;
    const viewportId = viewportIdRef.current;

    // Регистрируем инструменты
    registerTools();

    // Создаем RenderingEngine
    const renderingEngine = new RenderingEngine(renderingEngineId);
    renderingEngineRef.current = renderingEngine;

    // Настраиваем viewport
    const viewportInput = {
      viewportId,
      element: viewportRef.current,
      type: csEnums.ViewportType.STACK,
    };

    // Включаем viewport
    renderingEngine.enableElement(viewportInput);

    // Создаем ToolGroup и привязываем к viewport
    createToolGroup(viewportId, renderingEngineId);

    // Добавляем слушатель для предупреждения о Sigmoid VOI
    // при изменении WW/WL с помощью мыши
    const element = viewportRef.current;

    const handleMouseDown = (evt) => {
      // Проверяем, что это левая кнопка мыши (WindowLevelTool)
      if (evt.button === 0) {
        const viewport = renderingEngine.getViewport(viewportId);
        if (viewport) {
          // Просто показываем warning, если активен Sigmoid
          warnIfSigmoid(viewport);
        }
      }
    };

    element.addEventListener('mousedown', handleMouseDown);

    console.log('Stack Viewport created:', viewportId);

    // Очистка при размонтировании
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      if (renderingEngineRef.current) {
        renderingEngineRef.current.destroy();
      }
    };
  }, []);

  // Загрузка и отображение изображений
  useEffect(() => {
    if (!renderingEngineRef.current || !imageIds || imageIds.length === 0) {
      return;
    }

    const loadAndDisplayImages = async () => {
      try {
        const viewport = renderingEngineRef.current.getViewport(viewportIdRef.current);

        // Устанавливаем стек изображений
        await viewport.setStack(imageIds, 0); // 0 - индекс первого изображения

        // Рендерим
        viewport.render();

        console.log(`Loaded ${imageIds.length} images into viewport`);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadAndDisplayImages();
  }, [imageIds]);

  return (
    <div className="viewport-area" style={{ position: 'relative' }}>
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
      <div
        ref={viewportRef}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
        }}
      />
    </div>
  );
};

export default ViewportArea;
