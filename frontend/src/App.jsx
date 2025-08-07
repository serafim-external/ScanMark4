import React, { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';

import {
  RenderingEngine,
  Enums as csEnums,
  init as cornerstoneCoreInit,
  metaData,
  imageLoader,
} from '@cornerstonejs/core';

import {
  ToolGroupManager,
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollTool,
  Enums as csToolsEnums,
  addTool,
  init as cornerstoneToolsInit,
} from '@cornerstonejs/tools';

import {
  init as dicomImageLoaderInit,
} from '@cornerstonejs/dicom-image-loader';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [activeViewport, setActiveViewport] = useState(1);
  const [showPacsModal, setShowPacsModal] = useState(false);
  const [keySequence, setKeySequence] = useState('');
  const [keyTimeout, setKeyTimeout] = useState(null);
  const [displaySequence, setDisplaySequence] = useState('');
  
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

  const viewport1Ref = useRef(null);
  const viewport2Ref = useRef(null);
  const viewport3Ref = useRef(null);
  const viewport4Ref = useRef(null);
  const fileInputRef = useRef(null);

  const [viewports, setViewports] = useState({
    viewport1: { viewport: null, renderingEngine: null },
    viewport2: { viewport: null, renderingEngine: null },
    viewport3: { viewport: null, renderingEngine: null },
    viewport4: { viewport: null, renderingEngine: null }
  });

  // Define resetViewport function first
  const resetViewport = useCallback(() => {
    const viewportId = `viewport${activeViewport}`;
    if (viewports[viewportId].viewport) {
      viewports[viewportId].viewport.resetCamera();
      viewports[viewportId].viewport.render();
    }
  }, [activeViewport, viewports]);

  // Keyboard shortcuts handler with sequential key presses
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      
      // Only handle number keys 1-5
      if (!/^[1-5]$/.test(key)) {
        return;
      }
      
      event.preventDefault();
      
      // Clear existing timeout
      if (keyTimeout) {
        clearTimeout(keyTimeout);
      }
      
      const newSequence = keySequence + key;
      setKeySequence(newSequence);
      setDisplaySequence(newSequence);
      
      // Handle complete sequences (2 digits)
      if (newSequence.length === 2) {
        handleKeySequence(newSequence);
        setKeySequence('');
        setKeyTimeout(null);
        // Keep showing the complete sequence for a bit longer
        setTimeout(() => {
          setDisplaySequence('');
        }, 1500);
      } else {
        // Set timeout to reset sequence after 1 second
        const timeout = setTimeout(() => {
          setKeySequence('');
          setKeyTimeout(null);
          setDisplaySequence('');
        }, 1000);
        setKeyTimeout(timeout);
      }
    };

    const handleKeySequence = (sequence) => {
      switch (sequence) {
        // Group 1 - View
        case '11':
          console.log('Layout tool activated (11)');
          break;
        case '12':
          console.log('Stack tool activated (12)');
          break;
        
        // Group 2 - Image  
        case '21':
          console.log('Zoom tool activated (21)');
          break;
        case '22':
          console.log('W/L tool activated (22)');
          break;
        
        // Group 3 - Measure
        case '31':
          console.log('Length tool activated (31)');
          break;
        case '32':
          console.log('Angle tool activated (32)');
          break;
        
        // Group 4 - Actions
        case '41':
          resetViewport();
          console.log('Reset activated (41)');
          break;
        
        // Group 5 - Presets
        case '51':
          console.log('Preset tool activated (51)');
          break;
        
        default:
          console.log(`Unknown key sequence: ${sequence}`);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (keyTimeout) {
        clearTimeout(keyTimeout);
      }
    };
  }, [resetViewport, keySequence, keyTimeout]);

  // Initialize Cornerstone
  useEffect(() => {
    if (isInitialized) return;

    const initCornerstone = async () => {
      try {
        await cornerstoneCoreInit();
        dicomImageLoaderInit({ useWebWorkers: false });
        await cornerstoneToolsInit();

        addTool(WindowLevelTool);
        addTool(PanTool);
        addTool(ZoomTool);
        addTool(StackScrollTool);

        const newViewports = { ...viewports };
        const refs = { 
          viewport1: viewport1Ref, 
          viewport2: viewport2Ref, 
          viewport3: viewport3Ref, 
          viewport4: viewport4Ref 
        };

        for (const viewportId of ['viewport1', 'viewport2', 'viewport3', 'viewport4']) {
          const renderingEngine = new RenderingEngine(`${viewportId}RenderingEngine`);
          const stackId = `${viewportId}_STACK`;
          
          if (refs[viewportId].current) {
            const viewportInput = {
              viewportId: stackId,
              element: refs[viewportId].current,
              type: csEnums.ViewportType.STACK,
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

            toolGroup.setToolActive(PanTool.toolName, { bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }] });
            toolGroup.setToolActive(ZoomTool.toolName, { bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }] });
            toolGroup.setToolActive(StackScrollTool.toolName, { bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }] });
            toolGroup.setToolActive(WindowLevelTool.toolName, { bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary, modifierKey: csToolsEnums.KeyboardBindings.Shift }] });

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
  }, [isInitialized, viewports]);

  // Handle file loading
  const handleFileLoad = useCallback(async (files) => {
    const dicomFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.dcm') || 
      file.name.toLowerCase().endsWith('.dicom') ||
      file.name.toLowerCase().endsWith('.ima') ||
      !file.name.includes('.')
    );

    if (dicomFiles.length === 0) {
      alert('No DICOM files found');
      return;
    }

    const organizedData = await organizeDicomFiles(dicomFiles);
    
    if (organizedData.length > 0) {
      setSelectedPatient(organizedData[0]);
      if (organizedData[0].studies.length > 0) {
        setSelectedStudy(organizedData[0].studies[0]);
        if (organizedData[0].studies[0].series.length > 0) {
          setSelectedSeries(organizedData[0].studies[0].series[0]);
        }
      }
    }
  }, []);

  const organizeDicomFiles = async (files) => {
    const patients = {};
    
    for (const file of files) {
      try {
        const imageId = 'wadouri:' + URL.createObjectURL(file);
        await imageLoader.loadAndCacheImage(imageId);
        
        const patientId = metaData.get('00100020', imageId) || 'Unknown';
        const patientName = metaData.get('00100010', imageId) || 'Unknown Patient';
        const studyInstanceUID = metaData.get('0020000d', imageId) || 'Unknown Study';
        const studyDescription = metaData.get('00081030', imageId) || 'Unknown Study';
        const studyDate = metaData.get('00080020', imageId) || '';
        const seriesInstanceUID = metaData.get('0020000e', imageId) || 'Unknown Series';
        const seriesDescription = metaData.get('0008103e', imageId) || 'Unknown Series';
        const modality = metaData.get('00080060', imageId) || 'UN';
        const instanceNumber = parseInt(metaData.get('00200013', imageId) || '1');

        if (!patients[patientId]) {
          patients[patientId] = {
            patientId,
            patientName,
            studies: {}
          };
        }

        if (!patients[patientId].studies[studyInstanceUID]) {
          patients[patientId].studies[studyInstanceUID] = {
            studyInstanceUID,
            studyDescription,
            studyDate,
            series: {}
          };
        }

        if (!patients[patientId].studies[studyInstanceUID].series[seriesInstanceUID]) {
          patients[patientId].studies[studyInstanceUID].series[seriesInstanceUID] = {
            seriesInstanceUID,
            seriesDescription,
            modality,
            images: []
          };
        }

        patients[patientId].studies[studyInstanceUID].series[seriesInstanceUID].images.push({
          imageId,
          instanceNumber,
          file
        });

      } catch (error) {
        console.error('Error processing DICOM file:', error);
      }
    }

    // Convert to array format and sort
    return Object.values(patients).map(patient => ({
      ...patient,
      studies: Object.values(patient.studies).map(study => ({
        ...study,
        series: Object.values(study.series).map(series => ({
          ...series,
          images: series.images.sort((a, b) => a.instanceNumber - b.instanceNumber)
        }))
      }))
    }));
  };

  const loadSeriesToViewport = async (series, viewportId) => {
    if (!viewports[viewportId].viewport || !series) return;

    const imageIds = series.images.map(img => img.imageId);
    const stack = { imageIds, currentImageIdIndex: 0 };

    await viewports[viewportId].viewport.setStack(stack);
    viewports[viewportId].viewport.render();

    setViewportSeries(prev => ({
      ...prev,
      [viewportId]: series
    }));

    setViewportImages(prev => ({
      ...prev,
      [viewportId]: { current: 1, total: imageIds.length }
    }));

    setActiveViewport(parseInt(viewportId.replace('viewport', '')));
  };

  const handleLocalFiles = () => {
    fileInputRef.current?.click();
  };

  const handlePacs = () => {
    setShowPacsModal(true);
  };

  // Sources Panel Component
  const SourcesPanel = () => (
    <div style={{
      padding: '8px',
      display: 'flex',
      gap: '8px',
      width: '100%'
    }}>
      <button 
        onClick={handleLocalFiles}
        style={sourceButtonStyle}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
      >
        Local Files
      </button>
      <button 
        onClick={handlePacs}
        style={sourceButtonStyle}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#1a1a1a'}
      >
        PACS
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        webkitdirectory="true"
        onChange={(e) => handleFileLoad(e.target.files)}
        style={{ display: 'none' }}
      />
    </div>
  );

  // Tools Panel Component
  const ToolsPanel = () => (
    <div style={{
      padding: '8px',
      display: 'flex',
      gap: '8px',
      fontSize: '12px',
      color: '#e0e0e0',
      position: 'relative',
      width: '100%',
      justifyContent: 'center'
    }}>
      <div style={toolGroupStyle}>
        <span style={toolGroupTitleStyle}>1.View</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            style={toolButtonStyle} 
            title="Press 1-1 (11)"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
          >1.Layout<br/>11</button>
          <button 
            style={toolButtonStyle} 
            title="Press 1-2 (12)"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
          >2.Stack<br/>12</button>
        </div>
      </div>
      
      <div style={toolGroupStyle}>
        <span style={toolGroupTitleStyle}>2.Image</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            style={toolButtonStyle} 
            title="Press 2-1 (21)"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
          >1.Zoom<br/>21</button>
          <button 
            style={toolButtonStyle} 
            title="Press 2-2 (22)"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
          >2.W/L<br/>22</button>
        </div>
      </div>
      
      <div style={toolGroupStyle}>
        <span style={toolGroupTitleStyle}>3.Measure</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            style={toolButtonStyle} 
            title="Press 3-1 (31)"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
          >1.Length<br/>31</button>
          <button 
            style={toolButtonStyle} 
            title="Press 3-2 (32)"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
          >2.Angle<br/>32</button>
        </div>
      </div>
      
      <div style={toolGroupStyle}>
        <span style={toolGroupTitleStyle}>4.Actions</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            style={toolButtonStyle} 
            title="Press 4-1 (41)"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
          >1.Reset<br/>41</button>
        </div>
      </div>
      
      <div style={toolGroupStyle}>
        <span style={toolGroupTitleStyle}>5.Presets</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            style={toolButtonStyle} 
            title="Press 5-1 (51)"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
          >1.Preset<br/>51</button>
        </div>
      </div>
      
      {/* Key sequence indicator */}
      {displaySequence && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '8px',
          backgroundColor: 'rgba(0, 255, 0, 0.8)',
          color: 'black',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '11px',
          fontWeight: 'bold'
        }}>
          {displaySequence}
        </div>
      )}
    </div>
  );

  // Browser Panel Component
  const BrowserPanel = () => (
    <div style={{
      padding: '8px',
      height: '100%',
      overflow: 'auto',
      fontSize: '12px',
      color: '#e0e0e0'
    }}>
      {selectedPatient && (
        <>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', color: '#ffffff' }}>► Patient</div>
            <div style={{ marginLeft: '16px' }}>
              <div>{selectedPatient.patientName}</div>
              <div>ID: {selectedPatient.patientId}</div>
            </div>
          </div>

          {selectedStudy && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', color: '#ffffff' }}>► Study</div>
              <div style={{ marginLeft: '16px' }}>
                <div>{selectedStudy.studyDescription}</div>
                <div>{selectedStudy.studyDate}</div>
              </div>
            </div>
          )}

          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ffffff' }}>► Series:</div>
          {selectedStudy?.series?.map((series) => (
            <div 
              key={series.seriesInstanceUID} 
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px',
                padding: '4px',
                backgroundColor: selectedSeries?.seriesInstanceUID === series.seriesInstanceUID ? '#444' : 'transparent',
                cursor: 'pointer',
                border: '1px solid #333'
              }}
              onClick={() => setSelectedSeries(series)}
              onDoubleClick={() => loadSeriesToViewport(series, 'viewport1')}
            >
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#666',
                marginRight: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px'
              }}>
                ████<br/>████<br/>████
              </div>
              <div>
                <div style={{ fontWeight: 'bold', color: '#ffffff' }}>{series.modality}</div>
                <div>{series.seriesDescription}</div>
                <div>{series.images.length}img</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  // Viewport Area Component
  const ViewportArea = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: '2px',
      height: '100%',
      backgroundColor: '#2a2a2a'
    }}>
      {[1, 2, 3, 4].map(vpNum => (
        <div 
          key={vpNum}
          style={{
            position: 'relative',
            backgroundColor: '#1a1a1a',
            border: activeViewport === vpNum ? '2px solid #00ff00' : '1px solid #333',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={() => setActiveViewport(vpNum)}
        >
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            color: '#e0e0e0',
            fontSize: '10px',
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '2px 4px',
            borderRadius: '2px'
          }}>
            Viewport {vpNum} {activeViewport === vpNum ? '[ACTIVE]' : ''}
            <br/>
            Image: {viewportImages[`viewport${vpNum}`].current}/{viewportImages[`viewport${vpNum}`].total}
          </div>
          
          <div 
            ref={vpNum === 1 ? viewport1Ref : vpNum === 2 ? viewport2Ref : vpNum === 3 ? viewport3Ref : viewport4Ref}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e0e0e0',
              fontSize: '14px'
            }}
          >
            {!viewportSeries[`viewport${vpNum}`] && 'Empty'}
          </div>
        </div>
      ))}
    </div>
  );

  const toolButtonStyle = {
    padding: '4px 8px',
    backgroundColor: '#333',
    color: '#e0e0e0',
    border: '1px solid #555',
    borderRadius: '2px',
    cursor: 'pointer',
    fontSize: '10px',
    lineHeight: '1.2'
  };

  const toolGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '6px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '4px',
    minWidth: '80px'
  };

  const toolGroupTitleStyle = {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '2px'
  };

  const sourceButtonStyle = {
    padding: '6px',
    backgroundColor: '#1a1a1a',
    color: '#e0e0e0',
    border: '1px solid #444',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    height: '68px', // Точная высота как у групп инструментов (включая padding + content)
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    flex: 1 // Каждая кнопка занимает равную долю (50%)
  };

  // PACS Modal Component
  const PacsModal = () => showPacsModal && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '8px',
        color: '#e0e0e0',
        minWidth: '400px'
      }}>
        <h3 style={{ color: '#ffffff' }}>PACS Connection</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Server URL:</label>
          <input type="text" style={{ width: '100%', padding: '4px', marginTop: '4px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Port:</label>
          <input type="text" style={{ width: '100%', padding: '4px', marginTop: '4px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>AE Title:</label>
          <input type="text" style={{ width: '100%', padding: '4px', marginTop: '4px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowPacsModal(false)} style={{
            padding: '8px 16px',
            backgroundColor: '#666',
            color: '#e0e0e0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#0066cc',
            color: '#e0e0e0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Connect
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="medical-viewer-container">
      {/* Sources Panel - Top Left */}
      <div className="sources-panel">
        <SourcesPanel />
      </div>

      {/* Tools Panel - Top Right */}
      <div className="tools-panel">
        <ToolsPanel />
      </div>

      {/* Browser Panel - Bottom Left */}
      <div className="browser-panel">
        <BrowserPanel />
      </div>

      {/* Viewport Area - Bottom Right */}
      <div className="viewport-area">
        <ViewportArea />
      </div>

      {/* PACS Modal */}
      <PacsModal />
    </div>
  );
}

export default App;