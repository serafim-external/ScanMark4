import { useState } from 'react';
import './App.css';

import SourcesPanel from './components/SourcesPanel';
import ToolsPanel from './components/ToolsPanel';
import BrowserPanel from './components/BrowserPanel';
import ViewportArea from './components/ViewportArea';
import PacsModal from './components/PacsModal';

function App() {
  const [showPacsModal, setShowPacsModal] = useState(false);

  return (
    <div className="medical-viewer-container">
      <div className="sources-panel">
        <SourcesPanel onPacs={() => setShowPacsModal(true)} />
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

      <PacsModal
        isOpen={showPacsModal}
        onClose={() => setShowPacsModal(false)}
      />
    </div>
  );
}

export default App;
