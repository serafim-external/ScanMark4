import { useState } from 'react';
import Button from './Button';
import DropdownButton from './DropdownButton';
import WindowPresetsDropdown from './WindowPresetsDropdown';
import {
  LayoutIcon,
  ZoomIcon,
  PanIcon,
  WindowLevelIcon,
  StackScrollIcon,
  PreviousImageIcon,
  NextImageIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  RotateRightIcon,
  InvertIcon,
  ColormapIcon,
  ResetIcon,
  ChevronDownIcon
} from './Icons';
import { getRenderingEngine, Enums } from '@cornerstonejs/core';
import { COMMON_COLORMAPS } from '../constants/colormaps';

const ToolsPanel = () => {
  const [isColormapActive, setIsColormapActive] = useState(false);
  // Handler для кнопки Previous Image
  const handlePreviousImage = () => {
    try {
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_STACK';

      // Get the rendering engine
      const renderingEngine = getRenderingEngine(renderingEngineId);

      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      // Get the stack viewport
      const viewport = renderingEngine.getViewport(viewportId);

      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      // Get the current index of the image displayed
      const currentImageIdIndex = viewport.getCurrentImageIdIndex();

      // Decrement the index, clamping to the first image if necessary
      let newImageIdIndex = currentImageIdIndex - 1;
      newImageIdIndex = Math.max(newImageIdIndex, 0);

      // Set the new image index, the viewport itself does a re-render
      viewport.setImageIdIndex(newImageIdIndex);
    } catch (error) {
      console.error('Error in handlePreviousImage:', error);
    }
  };

  // Handler для кнопки Next Image
  const handleNextImage = () => {
    try {
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_STACK';

      // Get the rendering engine
      const renderingEngine = getRenderingEngine(renderingEngineId);

      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      // Get the stack viewport
      const viewport = renderingEngine.getViewport(viewportId);

      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      // Get the current index of the image displayed
      const currentImageIdIndex = viewport.getCurrentImageIdIndex();

      // Increment the index, clamping to the last image if necessary
      const numImages = viewport.getImageIds().length;
      let newImageIdIndex = currentImageIdIndex + 1;
      newImageIdIndex = Math.min(newImageIdIndex, numImages - 1);

      // Set the new image index, the viewport itself does a re-render
      viewport.setImageIdIndex(newImageIdIndex);
    } catch (error) {
      console.error('Error in handleNextImage:', error);
    }
  };

  // Handler для кнопки Flip H
  const handleFlipHorizontal = () => {
    try {
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_STACK';

      // Get the rendering engine
      const renderingEngine = getRenderingEngine(renderingEngineId);

      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      // Get the stack viewport
      const viewport = renderingEngine.getViewport(viewportId);

      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      const { flipHorizontal } = viewport.getCamera();
      viewport.setCamera({ flipHorizontal: !flipHorizontal });

      viewport.render();
    } catch (error) {
      console.error('Error in handleFlipHorizontal:', error);
    }
  };

  // Handler для кнопки Flip V
  const handleFlipVertical = () => {
    try {
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_STACK';

      // Get the rendering engine
      const renderingEngine = getRenderingEngine(renderingEngineId);

      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      // Get the stack viewport
      const viewport = renderingEngine.getViewport(viewportId);

      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      const { flipVertical } = viewport.getCamera();
      viewport.setCamera({ flipVertical: !flipVertical });

      viewport.render();
    } catch (error) {
      console.error('Error in handleFlipVertical:', error);
    }
  };

  // Handler для кнопки Rotate Right (по часовой стрелке, +90 градусов)
  const handleRotateRight = () => {
    try {
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_STACK';

      // Get the rendering engine
      const renderingEngine = getRenderingEngine(renderingEngineId);

      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      // Get the stack viewport
      const viewport = renderingEngine.getViewport(viewportId);

      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      // Get the current rotation
      const { rotation } = viewport.getViewPresentation();
      // Add 90 degrees for clockwise rotation
      viewport.setViewPresentation({ rotation: rotation + 90 });

      viewport.render();
    } catch (error) {
      console.error('Error in handleRotateRight:', error);
    }
  };

  // Handler для кнопки Invert
  const handleInvert = () => {
    try {
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_STACK';

      // Get the rendering engine
      const renderingEngine = getRenderingEngine(renderingEngineId);

      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      // Get the stack viewport
      const viewport = renderingEngine.getViewport(viewportId);

      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      const { invert } = viewport.getProperties();
      viewport.setProperties({ invert: !invert });

      viewport.render();
    } catch (error) {
      console.error('Error in handleInvert:', error);
    }
  };

  // Handler для кнопки Colormap - переключает между HSV и Grayscale
  const handleColormapToggle = () => {
    try {
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_STACK';

      // Get the rendering engine
      const renderingEngine = getRenderingEngine(renderingEngineId);

      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      // Get the stack viewport
      const viewport = renderingEngine.getViewport(viewportId);

      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      // Check if viewport has images loaded (has actor)
      const defaultActor = viewport.getDefaultActor();
      if (!defaultActor) {
        console.warn('No image loaded in viewport. Load an image first before applying colormap.');
        return;
      }

      // Toggle between HSV and Grayscale
      if (isColormapActive) {
        // Reset to Grayscale (default medical imaging colormap)
        viewport.setProperties({ colormap: { name: 'Grayscale' } });
        setIsColormapActive(false);
      } else {
        // Apply HSV colormap
        viewport.setProperties({ colormap: { name: 'hsv' } });
        setIsColormapActive(true);
      }

      viewport.render();
    } catch (error) {
      console.error('Error in handleColormapToggle:', error);
    }
  };

  // Handler для выбора colormap из dropdown
  const handleColormapSelect = (colormap) => {
    try {
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_STACK';

      // Get the rendering engine
      const renderingEngine = getRenderingEngine(renderingEngineId);

      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      // Get the stack viewport
      const viewport = renderingEngine.getViewport(viewportId);

      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      // Check if viewport has images loaded (has actor)
      const defaultActor = viewport.getDefaultActor();
      if (!defaultActor) {
        console.warn('No image loaded in viewport. Load an image first before applying colormap.');
        return;
      }

      // Apply selected colormap from dropdown
      viewport.setProperties({ colormap: { name: colormap.name } });

      // Активируем кнопку colormap (все colormaps в списке кроме Grayscale)
      setIsColormapActive(true);

      viewport.render();
    } catch (error) {
      console.error('Error in handleColormapSelect:', error);
    }
  };

  // Handler для кнопки Reset Viewport
  const handleResetViewport = () => {
    try {
      const renderingEngineId = 'myRenderingEngine';
      const viewportId = 'CT_STACK';

      // Get the rendering engine
      const renderingEngine = getRenderingEngine(renderingEngineId);

      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      // Get the stack viewport
      const viewport = renderingEngine.getViewport(viewportId);

      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      // Best practice from cornerstone3D official examples:
      // Reset viewport following the pattern from stackAPI example

      // Resets the viewport's camera (pan, zoom, rotation, flip)
      viewport.resetCamera();

      // Note: resetProperties() does NOT reset VOILUTFunction
      // It only resets: VOI range, invert, interpolation, colormap
      // So we manually reset VOILUTFunction to LINEAR first to avoid Sigmoid issues
      viewport.setProperties({
        VOILUTFunction: Enums.VOILUTFunctionType.LINEAR
      });

      // Now reset other properties
      viewport.resetProperties();

      viewport.render();

      // Reset colormap state
      setIsColormapActive(false);
    } catch (error) {
      console.error('Error in handleResetViewport:', error);
    }
  };

  return (
    <div className="tools-panel">
      <div className="tools-panel-buttons">
        <Button title="Layout">
          <LayoutIcon />
        </Button>
        <Button title="Zoom">
          <ZoomIcon />
        </Button>
        <Button title="Pan">
          <PanIcon />
        </Button>
        <Button title="Window/Level">
          <WindowLevelIcon />
        </Button>
        <WindowPresetsDropdown
          icon={<ChevronDownIcon />}
          title="Window Presets"
        />
        <Button title="Stack Scroll">
          <StackScrollIcon />
        </Button>
        <Button title="Previous Image" onClick={handlePreviousImage}>
          <PreviousImageIcon />
        </Button>
        <Button title="Next Image" onClick={handleNextImage}>
          <NextImageIcon />
        </Button>
        <Button title="Flip Horizontal" onClick={handleFlipHorizontal}>
          <FlipHorizontalIcon />
        </Button>
        <Button title="Flip Vertical" onClick={handleFlipVertical}>
          <FlipVerticalIcon />
        </Button>
        <Button title="Rotate Right" onClick={handleRotateRight}>
          <RotateRightIcon />
        </Button>
        <Button title="Invert" onClick={handleInvert}>
          <InvertIcon />
        </Button>
        <Button title="Colormap" onClick={handleColormapToggle} active={isColormapActive}>
          <ColormapIcon />
        </Button>
        <DropdownButton
          icon={<ChevronDownIcon />}
          items={COMMON_COLORMAPS}
          onItemClick={handleColormapSelect}
          title="Select Colormap"
        />
        <Button title="Reset Viewport" onClick={handleResetViewport}>
          <ResetIcon />
        </Button>
      </div>
    </div>
  );
};

export default ToolsPanel;
