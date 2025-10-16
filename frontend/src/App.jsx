import { useEffect, useState } from 'react';
import './App.css';
import SourcesPanel from './components/SourcesPanel';
import ToolsPanel from './components/ToolsPanel';
import BrowserPanel from './components/BrowserPanel';
import ViewportArea from './components/ViewportArea';
import { initCornerstone } from './utils/initCornerstone';
import { AlertProvider } from './contexts/AlertContext';

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [imageIds, setImageIds] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        await initCornerstone();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Cornerstone:', error);
        setInitError(error.message);
      }
    };

    init();
  }, []);

  if (initError) {
    return (
      <div className="medical-viewer-container">
        <div style={{ padding: '20px', color: 'red' }}>
          Error initializing Cornerstone: {initError}
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="medical-viewer-container">
        <div style={{ padding: '20px' }}>
          Initializing Cornerstone3D...
        </div>
      </div>
    );
  }

  return (
    <AlertProvider>
      <div className="medical-viewer-container">
        <SourcesPanel onFilesLoaded={setImageIds} />
        <ToolsPanel />
        <BrowserPanel />
        <ViewportArea imageIds={imageIds} />
      </div>
    </AlertProvider>
  );
};

export default App;
