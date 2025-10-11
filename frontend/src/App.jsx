import './App.css';

import SourcesPanel from './components/SourcesPanel';
import ToolsPanel from './components/ToolsPanel';
import BrowserPanel from './components/BrowserPanel';
import ViewportArea from './components/ViewportArea';

function App() {
  return (
    <div className="medical-viewer-container">
      <SourcesPanel />
      <ToolsPanel />
      <BrowserPanel />
      <ViewportArea />
    </div>
  );
}

export default App;
