import { useEffect, useRef, useState, useCallback } from 'react';
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
        cornerstoneToolsInit();

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
      display: 'flex',
      gap: '16px',
      width: '100%',
      height: '100%',
      alignItems: 'center'
    }}>
      <button 
        onClick={handleLocalFiles}
        style={sourceButtonStyle}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        📁 Local Files
      </button>
      <button 
        onClick={handlePacs}
        style={sourceButtonStyle}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        🌐 PACS
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
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      position: 'relative'
    }}>
      <button 
        style={toolButtonStyle} 
        title="Press 1-1 (11)"
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }}
      >
        Layout
      </button>
      
      <button 
        style={toolButtonStyle} 
        title="Press 1-2 (12)"
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }}
      >
        Stack
      </button>
      
      <button 
        style={toolButtonStyle} 
        title="Press 2-1 (21)"
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }}
      >
        Zoom
      </button>
      
      <button 
        style={toolButtonStyle} 
        title="Press 2-2 (22)"
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }}
      >
        W/L
      </button>
      
      <button 
        style={toolButtonStyle} 
        title="Press 3-1 (31)"
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }}
      >
        Length
      </button>
      
      <button 
        style={toolButtonStyle} 
        title="Press 3-2 (32)"
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }}
      >
        Angle
      </button>
      
      <button 
        style={toolButtonStyle} 
        title="Press 4-1 (41)"
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }}
      >
        Reset
      </button>
      
      {/* Key sequence indicator */}
      {displaySequence && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 3px 6px rgba(40,167,69,0.3)',
          border: '2px solid #20c997'
        }}>
          {displaySequence}
        </div>
      )}
    </div>
  );

  // Browser Panel Component
  const BrowserPanel = () => (
    <div style={{
      height: '100%',
      overflow: 'auto',
      fontSize: '14px',
      color: '#495057'
    }}>
      {selectedPatient ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ 
              fontWeight: '600', 
              color: '#2c3e50', 
              fontSize: '16px',
              marginBottom: '8px',
              paddingBottom: '8px',
              borderBottom: '2px solid #e1e8ed'
            }}>
              👤 Patient
            </div>
            <div style={{ marginLeft: '8px', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '500' }}>{selectedPatient.patientName}</div>
              <div style={{ color: '#6c757d', fontSize: '13px' }}>ID: {selectedPatient.patientId}</div>
            </div>
          </div>

          {selectedStudy && (
            <div>
              <div style={{ 
                fontWeight: '600', 
                color: '#2c3e50', 
                fontSize: '16px',
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: '2px solid #e1e8ed'
              }}>
                📋 Study
              </div>
              <div style={{ marginLeft: '8px', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '500' }}>{selectedStudy.studyDescription}</div>
                <div style={{ color: '#6c757d', fontSize: '13px' }}>{selectedStudy.studyDate}</div>
              </div>
            </div>
          )}

          <div>
            <div style={{ 
              fontWeight: '600', 
              color: '#2c3e50', 
              fontSize: '16px',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '2px solid #e1e8ed'
            }}>
              🗂️ Series
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedStudy?.series?.map((series) => (
                <div 
                  key={series.seriesInstanceUID} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: selectedSeries?.seriesInstanceUID === series.seriesInstanceUID ? '#e7f3ff' : '#ffffff',
                    cursor: 'pointer',
                    border: '1px solid #e1e8ed',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => setSelectedSeries(series)}
                  onDoubleClick={() => loadSeriesToViewport(series, 'viewport1')}
                  onMouseEnter={(e) => {
                    if (selectedSeries?.seriesInstanceUID !== series.seriesInstanceUID) {
                      e.target.style.backgroundColor = '#f8f9fa';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 3px 6px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedSeries?.seriesInstanceUID !== series.seriesInstanceUID) {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    }
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f0f2f5',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}>
                    🖼️
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '2px' }}>
                      {series.modality}
                    </div>
                    <div style={{ fontSize: '13px', color: '#495057', marginBottom: '2px' }}>
                      {series.seriesDescription}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {series.images.length} images
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#6c757d',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
            No files loaded
          </div>
          <div style={{ fontSize: '13px' }}>
            Select local files or connect to PACS to get started
          </div>
        </div>
      )}
    </div>
  );

  // Viewport Area Component
  const ViewportArea = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gap: '4px',
      height: '100%',
      backgroundColor: 'transparent'
    }}>
      {[1, 2, 3, 4].map(vpNum => (
        <div 
          key={vpNum}
          style={{
            position: 'relative',
            backgroundColor: '#ffffff',
            border: activeViewport === vpNum ? '3px solid #007bff' : '1px solid #e1e8ed',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: activeViewport === vpNum ? '0 4px 12px rgba(0,123,255,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={() => setActiveViewport(vpNum)}
          onMouseEnter={(e) => {
            if (activeViewport !== vpNum) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeViewport !== vpNum) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }
          }}
        >
          <div 
            ref={vpNum === 1 ? viewport1Ref : vpNum === 2 ? viewport2Ref : vpNum === 3 ? viewport3Ref : viewport4Ref}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#fafbfc'
            }}
          />
        </div>
      ))}
    </div>
  );

  const toolButtonStyle = {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    color: '#495057',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };


  const sourceButtonStyle = {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    color: '#495057',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flex: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  // PACS Modal Component
  const PacsModal = () => showPacsModal && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '16px',
        color: '#495057',
        minWidth: '450px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        border: '1px solid #e1e8ed'
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          fontSize: '24px', 
          fontWeight: '600',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🌐 PACS Connection
        </h3>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '8px',
            color: '#495057'
          }}>
            Server URL:
          </label>
          <input 
            type="text" 
            placeholder="http://example.com" 
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              fontSize: '14px',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#495057',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }} 
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '8px',
            color: '#495057'
          }}>
            Port:
          </label>
          <input 
            type="text" 
            placeholder="11112" 
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              fontSize: '14px',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#495057',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }} 
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '8px',
            color: '#495057'
          }}>
            AE Title:
          </label>
          <input 
            type="text" 
            placeholder="VIEWER" 
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              fontSize: '14px',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#495057',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }} 
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setShowPacsModal(false)} 
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffffff',
              color: '#6c757d',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.borderColor = '#adb5bd';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#dee2e6';
            }}
          >
            Cancel
          </button>
          <button 
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: '#ffffff',
              border: '1px solid #007bff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.borderColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.borderColor = '#007bff';
            }}
          >
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