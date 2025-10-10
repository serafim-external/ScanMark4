import { useEffect, useState, useCallback } from 'react';
import {
  RenderingEngine,
  Enums as csEnums,
  init as cornerstoneCoreInit
} from '@cornerstonejs/core';
import {
  ToolGroupManager,
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollTool,
  Enums as csToolsEnums,
  addTool,
  init as cornerstoneToolsInit
} from '@cornerstonejs/tools';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';

export const useCornerstoneViewports = (viewportRefs) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeViewport, setActiveViewport] = useState(1);
  const [viewports, setViewports] = useState({
    viewport1: { viewport: null, renderingEngine: null },
    viewport2: { viewport: null, renderingEngine: null },
    viewport3: { viewport: null, renderingEngine: null },
    viewport4: { viewport: null, renderingEngine: null }
  });
  const [viewportSeries, setViewportSeries] = useState({
    viewport1: null,
    viewport2: null,
    viewport3: null,
    viewport4: null
  });
  const [viewportImages, setViewportImages] = useState({
    viewport1: { current: 0, total: 0 },
    viewport2: { current: 0, total: 0 },
    viewport3: { current: 0, total: 0 },
    viewport4: { current: 0, total: 0 }
  });

  const resetViewport = useCallback(() => {
    const viewportId = `viewport${activeViewport}`;
    if (viewports[viewportId].viewport) {
      viewports[viewportId].viewport.resetCamera();
      viewports[viewportId].viewport.render();
    }
  }, [activeViewport, viewports]);

  const loadSeriesToViewport = async (series, viewportId) => {
    if (!viewports[viewportId].viewport || !series) return;

    const imageIds = series.images.map(img => img.imageId);
    const stack = { imageIds, currentImageIdIndex: 0 };

    await viewports[viewportId].viewport.setStack(stack);
    viewports[viewportId].viewport.render();

    setViewportSeries(prev => ({ ...prev, [viewportId]: series }));
    setViewportImages(prev => ({
      ...prev,
      [viewportId]: { current: 1, total: imageIds.length }
    }));
    setActiveViewport(parseInt(viewportId.replace('viewport', '')));
  };

  useEffect(() => {
    if (isInitialized) return;

    const initCornerstone = async () => {
      try {
        await cornerstoneCoreInit();
        dicomImageLoaderInit({ useWebWorkers: false });
        cornerstoneToolsInit();

        addTool(WindowLevelTool);
        addTool(PanTool);
        addTool(ZoomTool);
        addTool(StackScrollTool);

        const newViewports = {};
        const viewportIds = ['viewport1', 'viewport2', 'viewport3', 'viewport4'];

        for (const viewportId of viewportIds) {
          const renderingEngine = new RenderingEngine(`${viewportId}RenderingEngine`);
          const stackId = `${viewportId}_STACK`;

          if (viewportRefs[viewportId].current) {
            const viewportInput = {
              viewportId: stackId,
              element: viewportRefs[viewportId].current,
              type: csEnums.ViewportType.STACK
            };

            renderingEngine.enableElement(viewportInput);

            let toolGroup;
            try {
              toolGroup = ToolGroupManager.getToolGroup(`${viewportId}ToolGroup`);
              if (!toolGroup) {
                toolGroup = ToolGroupManager.createToolGroup(`${viewportId}ToolGroup`);
              }
            } catch {
              toolGroup = ToolGroupManager.createToolGroup(`${viewportId}ToolGroup`);
            }

            toolGroup.addTool(WindowLevelTool.toolName);
            toolGroup.addTool(PanTool.toolName);
            toolGroup.addTool(ZoomTool.toolName);
            toolGroup.addTool(StackScrollTool.toolName);
            toolGroup.addViewport(stackId, renderingEngine.id);

            toolGroup.setToolActive(PanTool.toolName, {
              bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }]
            });
            toolGroup.setToolActive(ZoomTool.toolName, {
              bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }]
            });
            toolGroup.setToolActive(StackScrollTool.toolName, {
              bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }]
            });
            toolGroup.setToolActive(WindowLevelTool.toolName, {
              bindings: [{
                mouseButton: csToolsEnums.MouseBindings.Primary,
                modifierKey: csToolsEnums.KeyboardBindings.Shift
              }]
            });

            const viewport = renderingEngine.getViewport(stackId);
            newViewports[viewportId] = { viewport, renderingEngine };
          }
        }

        setViewports(newViewports);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Cornerstone:', error);
      }
    };

    initCornerstone();
  }, [isInitialized, viewportRefs]);

  return {
    viewports,
    activeViewport,
    setActiveViewport,
    viewportSeries,
    viewportImages,
    resetViewport,
    loadSeriesToViewport
  };
};
