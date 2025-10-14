import Button from './Button';
import {
  LayoutIcon,
  ZoomIcon,
  PanIcon,
  WindowLevelIcon,
  StackScrollIcon,
  PreviousImageIcon,
  NextImageIcon
} from './Icons';
import { getRenderingEngine } from '@cornerstonejs/core';

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
        <Button title="Stack Scroll">
          <StackScrollIcon />
        </Button>
        <Button title="Previous Image" onClick={handlePreviousImage}>
          <PreviousImageIcon />
        </Button>
        <Button title="Next Image" onClick={handleNextImage}>
          <NextImageIcon />
        </Button>
      </div>
    </div>
  );
};

export default ToolsPanel;
