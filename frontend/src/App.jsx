import './App.css';

import SourcesPanel from './components/SourcesPanel';
import ToolsPanel from './components/ToolsPanel';
import BrowserPanel from './components/BrowserPanel';
import ViewportArea from './components/ViewportArea';

function App() {
  return (
    <div className="medical-viewer-container">
      <div className="sources-panel">
        <SourcesPanel />
      </div>

      <div className="tools-panel">
        <ToolsPanel />
      </div>

      <div className="browser-panel">
        <BrowserPanel />
      </div>

      <div className="viewport-area">
        <ViewportArea />
      </div>
    </div>
  );
}

export default App;
