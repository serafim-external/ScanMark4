import { useRef, useState } from 'react';
import './App.css';

import SourcesPanel from './components/SourcesPanel';
import ToolsPanel from './components/ToolsPanel';
import BrowserPanel from './components/BrowserPanel';
import ViewportArea from './components/ViewportArea';
import PacsModal from './components/PacsModal';

import { useDicomLoader } from './hooks/useDicomLoader';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useCornerstoneViewports } from './hooks/useCornerstoneViewports';

function App() {
  const [showPacsModal, setShowPacsModal] = useState(false);

  const viewport1Ref = useRef(null);
  const viewport2Ref = useRef(null);
  const viewport3Ref = useRef(null);
  const viewport4Ref = useRef(null);

  const viewportRefs = {
    viewport1: viewport1Ref,
    viewport2: viewport2Ref,
    viewport3: viewport3Ref,
    viewport4: viewport4Ref
  };

  const {
    viewports,
    activeViewport,
    setActiveViewport,
    resetViewport,
    loadSeriesToViewport
  } = useCornerstoneViewports(viewportRefs);

  const {
    selectedPatient,
    selectedStudy,
    selectedSeries,
    setSelectedSeries,
    handleFileLoad
  } = useDicomLoader();

  const { displaySequence } = useKeyboardShortcuts(resetViewport);

  return (
    <div className="medical-viewer-container">
      <div className="sources-panel">
        <SourcesPanel
          onLocalFiles={handleFileLoad}
          onPacs={() => setShowPacsModal(true)}
        />
      </div>

      <div className="tools-panel">
        <ToolsPanel displaySequence={displaySequence} />
      </div>

      <div className="browser-panel">
        <BrowserPanel
          selectedPatient={selectedPatient}
          selectedStudy={selectedStudy}
          selectedSeries={selectedSeries}
          onSeriesSelect={setSelectedSeries}
          onSeriesLoad={loadSeriesToViewport}
        />
      </div>

      <div className="viewport-area">
        <ViewportArea
          viewportRefs={viewportRefs}
          activeViewport={activeViewport}
          onViewportClick={setActiveViewport}
        />
      </div>

      <PacsModal
        isOpen={showPacsModal}
        onClose={() => setShowPacsModal(false)}
      />
    </div>
  );
}

export default App;
