import { useEffect, useRef } from 'react';
import { RenderingEngine, Enums } from '@cornerstonejs/core';

const ViewportArea = ({ imageIds }) => {
  const viewportRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const viewportIdRef = useRef('CT_STACK');

  // Инициализация viewport
  useEffect(() => {
    if (!viewportRef.current) return;

    const renderingEngineId = 'myRenderingEngine';
    const viewportId = viewportIdRef.current;

    // Создаем RenderingEngine
    const renderingEngine = new RenderingEngine(renderingEngineId);
    renderingEngineRef.current = renderingEngine;

    // Настраиваем viewport
    const viewportInput = {
      viewportId,
      element: viewportRef.current,
      type: Enums.ViewportType.STACK,
    };

    // Включаем viewport
    renderingEngine.enableElement(viewportInput);

    console.log('Stack Viewport created:', viewportId);

    // Очистка при размонтировании
    return () => {
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
    <div className="viewport-area">
      <div
        ref={viewportRef}
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
