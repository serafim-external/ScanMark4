import { useEffect, useRef, useState } from 'react';
import { RenderingEngine, Enums as csEnums, utilities } from '@cornerstonejs/core';
import { registerTools, createToolGroup } from '../utils/setupTools';
import { useAlerts } from '../contexts/AlertContext';
import AlertContainer from './AlertContainer';
import { setAlertCallback, warnIfSigmoid } from '../utils/voiManager';

const ViewportArea = ({ imageIds }) => {
  const viewportRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const viewportIdRef = useRef('CT_STACK');
  const renderingEngineIdRef = useRef('myRenderingEngine');
  const initialParallelScaleRef = useRef(null);
  const { alerts, removeAlert, addAlert } = useAlerts();

  // State для overlay информации
  const [imageInfo, setImageInfo] = useState({ current: 0, total: 0 });
  const [cameraInfo, setCameraInfo] = useState({ zoom: 1.0, pan: { x: 0, y: 0 } });
  const [voiInfo, setVoiInfo] = useState({ ww: 0, wl: 0 });

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

    // Добавляем обработчик события STACK_NEW_IMAGE
    // Согласно официальному примеру stackEvents
    const handleStackNewImage = () => {
      const viewport = renderingEngine.getViewport(viewportId);
      if (viewport) {
        const currentIndex = viewport.getCurrentImageIdIndex();
        const totalImages = viewport.getImageIds().length;
        setImageInfo({ current: currentIndex + 1, total: totalImages });
      }
    };

    element.addEventListener(csEnums.Events.STACK_NEW_IMAGE, handleStackNewImage);

    // Добавляем обработчик события CAMERA_MODIFIED
    // Для отображения информации о zoom и pan
    const handleCameraModified = (evt) => {
      const { camera } = evt.detail;
      if (camera && initialParallelScaleRef.current) {
        // parallelScale: чем меньше значение, тем больше zoom
        // Zoom factor: если parallelScale уменьшился в 2 раза, zoom = 2x
        const zoomFactor = initialParallelScaleRef.current / camera.parallelScale;

        setCameraInfo({
          zoom: zoomFactor,
          pan: {
            x: camera.position[0],
            y: camera.position[1],
          },
        });
      }
    };

    element.addEventListener(csEnums.Events.CAMERA_MODIFIED, handleCameraModified);

    // Добавляем обработчик события VOI_MODIFIED
    // Согласно официальному примеру ViewportColorbar и DICOM стандарту
    const handleVoiModified = (evt) => {
      const { range } = evt.detail;
      if (range) {
        // Используем официальную функцию cornerstone3D для конвертации
        // VOIRange (upper/lower) → Window Width/Window Level
        // Формулы из DICOM стандарта C.11.2.1.2.1:
        // WW = |high - low| + 1
        // WL = (low + high + 1) / 2
        const { windowWidth, windowCenter } = utilities.windowLevel.toWindowLevel(
          range.lower,
          range.upper
        );
        setVoiInfo({
          ww: Math.round(windowWidth),
          wl: Math.round(windowCenter)
        });
      }
    };

    element.addEventListener(csEnums.Events.VOI_MODIFIED, handleVoiModified);

    console.log('Stack Viewport created:', viewportId);

    // Очистка при размонтировании
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener(csEnums.Events.STACK_NEW_IMAGE, handleStackNewImage);
      element.removeEventListener(csEnums.Events.CAMERA_MODIFIED, handleCameraModified);
      element.removeEventListener(csEnums.Events.VOI_MODIFIED, handleVoiModified);
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

        // Сохраняем начальный parallelScale для вычисления zoom
        const initialCamera = viewport.getCamera();
        initialParallelScaleRef.current = initialCamera.parallelScale;

        // Инициализируем информацию об изображениях
        setImageInfo({ current: 1, total: imageIds.length });

        // Инициализируем VOI информацию
        const properties = viewport.getProperties();
        if (properties.voiRange) {
          const { upper, lower } = properties.voiRange;
          // Используем официальную функцию cornerstone3D (DICOM стандарт)
          const { windowWidth, windowCenter } = utilities.windowLevel.toWindowLevel(
            lower,
            upper
          );
          setVoiInfo({
            ww: Math.round(windowWidth),
            wl: Math.round(windowCenter)
          });
        }

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

      {/* Overlay с информацией об изображении - левый верхний угол */}
      {imageInfo.total > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            color: 'var(--text-viewport)',
            fontSize: '14px',
            fontWeight: '500',
            pointerEvents: 'none',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            zIndex: 10,
          }}
        >
          img: {imageInfo.current}/{imageInfo.total}
        </div>
      )}

      {/* Overlay с информацией о камере - правый верхний угол */}
      {imageInfo.total > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            color: 'var(--text-viewport)',
            fontSize: '14px',
            fontWeight: '500',
            pointerEvents: 'none',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            zIndex: 10,
            textAlign: 'right',
          }}
        >
          <div>Zoom: {cameraInfo.zoom.toFixed(2)}x</div>
        </div>
      )}

      {/* Overlay с информацией о VOI (WW/WL) - левый нижний угол */}
      {imageInfo.total > 0 && voiInfo.ww > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            color: 'var(--text-viewport)',
            fontSize: '14px',
            fontWeight: '500',
            pointerEvents: 'none',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
            zIndex: 10,
          }}
        >
          <div>W: {voiInfo.ww} L: {voiInfo.wl}</div>
        </div>
      )}

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
