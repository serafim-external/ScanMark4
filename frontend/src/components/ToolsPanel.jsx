import Button from './Button';
import DropdownButton from './DropdownButton';
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
import { getRenderingEngine, utilities } from '@cornerstonejs/core';
import { WINDOW_PRESETS_BY_CATEGORY } from '../constants/windowPresets';

const ToolsPanel = () => {
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

  // Handler для кнопки Apply Colormap
  const handleApplyColormap = () => {
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

      viewport.setProperties({ colormap: { name: 'hsv' } });
      viewport.render();
    } catch (error) {
      console.error('Error in handleApplyColormap:', error);
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

      // Resets the viewport's camera
      viewport.resetCamera();
      // Resets the viewport's properties
      viewport.resetProperties();
      viewport.render();
    } catch (error) {
      console.error('Error in handleResetViewport:', error);
    }
  };

  // Handler для выбора window preset
  const handleWindowPresetSelect = (preset) => {
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

      // Convert window width/level to VOI range using Cornerstone3D utility
      const { lower, upper } = utilities.windowLevel.toLowHighRange(
        preset.windowWidth,
        preset.windowCenter
      );

      // Apply the VOI range to the viewport
      viewport.setProperties({
        voiRange: { lower, upper }
      });

      viewport.render();
    } catch (error) {
      console.error('Error in handleWindowPresetSelect:', error);
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
        <DropdownButton
          icon={<ChevronDownIcon />}
          items={WINDOW_PRESETS_BY_CATEGORY}
          onItemClick={handleWindowPresetSelect}
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
        <Button title="Apply Colormap" onClick={handleApplyColormap}>
          <ColormapIcon />
        </Button>
        <Button title="Reset Viewport" onClick={handleResetViewport}>
          <ResetIcon />
        </Button>
      </div>
    </div>
  );
};

export default ToolsPanel;
