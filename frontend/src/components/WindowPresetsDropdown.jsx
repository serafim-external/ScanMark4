import { useState, useRef, useEffect } from 'react';
import { getRenderingEngine, utilities, Enums } from '@cornerstonejs/core';
import { WINDOW_PRESETS_BY_CATEGORY } from '../constants/windowPresets';
import { autoSwitchToLinear } from '../utils/voiManager';
import './WindowPresetsDropdown.css';

const WindowPresetsDropdown = ({ icon, title = 'Window Presets' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customWW, setCustomWW] = useState('');
  const [customWL, setCustomWL] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const [modality, setModality] = useState(null);
  const [voiFunction, setVoiFunction] = useState('LINEAR'); // LINEAR or SAMPLED_SIGMOID
  const dropdownRef = useRef(null);

  // Get current viewport modality and VOI function
  useEffect(() => {
    if (isOpen) {
      try {
        const renderingEngine = getRenderingEngine('myRenderingEngine');
        if (renderingEngine) {
          const viewport = renderingEngine.getViewport('CT_STACK');
          if (viewport) {
            const currentModality = utilities.getViewportModality(viewport);
            setModality(currentModality);
            // Auto-show presets if modality is CT
            setShowPresets(currentModality === 'CT');

            // Get current VOI function
            const properties = viewport.getProperties();
            if (properties.VOILUTFunction) {
              setVoiFunction(properties.VOILUTFunction);
            }
          }
        }
      } catch (error) {
        console.error('Error getting viewport modality:', error);
      }
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleApplyCustomWindow = () => {
    const ww = parseFloat(customWW);
    const wl = parseFloat(customWL);

    if (isNaN(ww) || isNaN(wl)) {
      alert('Please enter valid numbers for Window Width and Window Level');
      return;
    }

    if (ww <= 0) {
      alert('Window Width must be greater than 0');
      return;
    }

    applyWindow({ windowWidth: ww, windowCenter: wl });
    setIsOpen(false);
  };

  const handlePresetClick = (preset) => {
    applyWindow(preset);
    setIsOpen(false);
  };

  const applyWindow = (preset) => {
    try {
      const renderingEngine = getRenderingEngine('myRenderingEngine');
      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      const viewport = renderingEngine.getViewport('CT_STACK');
      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      // Auto-switch from SIGMOID to LINEAR if needed
      const wasSwitched = autoSwitchToLinear(viewport);
      if (wasSwitched) {
        // Update local state after auto-switch
        setVoiFunction(Enums.VOILUTFunctionType.LINEAR);
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
      console.error('Error applying window preset:', error);
    }
  };

  const handleVoiFunctionToggle = () => {
    try {
      const renderingEngine = getRenderingEngine('myRenderingEngine');
      if (!renderingEngine) {
        console.warn('Rendering engine not found');
        return;
      }

      const viewport = renderingEngine.getViewport('CT_STACK');
      if (!viewport) {
        console.warn('Viewport not found');
        return;
      }

      // Toggle between LINEAR and SAMPLED_SIGMOID
      const newFunction = voiFunction === Enums.VOILUTFunctionType.LINEAR
        ? Enums.VOILUTFunctionType.SAMPLED_SIGMOID
        : Enums.VOILUTFunctionType.LINEAR;

      viewport.setProperties({
        VOILUTFunction: newFunction
      });

      viewport.render();

      // Update state
      setVoiFunction(newFunction);
    } catch (error) {
      console.error('Error toggling VOI function:', error);
    }
  };

  const isCT = modality === 'CT';

  return (
    <div className="dropdown-button-container" ref={dropdownRef}>
      <button
        className="dropdown-button"
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        aria-label={title}
        aria-expanded={isOpen}
      >
        {icon}
      </button>

      {isOpen && (
        <div className="window-dropdown-menu">
          {/* Custom Window Input */}
          <div className="custom-window-section">
            <div className="custom-window-header">Custom Window</div>
            <div className="custom-window-inputs">
              <div className="input-group">
                <label htmlFor="window-width">WW:</label>
                <input
                  id="window-width"
                  type="number"
                  placeholder="Width"
                  value={customWW}
                  onChange={(e) => setCustomWW(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomWindow()}
                />
              </div>
              <div className="input-group">
                <label htmlFor="window-level">WL:</label>
                <input
                  id="window-level"
                  type="number"
                  placeholder="Level"
                  value={customWL}
                  onChange={(e) => setCustomWL(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomWindow()}
                />
              </div>
            </div>
            <button className="apply-custom-button" onClick={handleApplyCustomWindow}>
              Apply
            </button>
          </div>

          {/* VOI LUT Function Toggle */}
          <div className="voi-function-section">
            <div className="presets-divider" />
            <label className="voi-function-label">
              <input
                type="checkbox"
                checked={voiFunction === Enums.VOILUTFunctionType.SAMPLED_SIGMOID}
                onChange={handleVoiFunctionToggle}
              />
              <span className="voi-function-text">
                Sigmoid VOI (smoother transitions)
              </span>
            </label>
            <div className="voi-function-info">
              Current: {voiFunction === Enums.VOILUTFunctionType.SAMPLED_SIGMOID ? 'Sigmoid' : 'Linear'}
            </div>
          </div>

          {/* Presets Section */}
          {!isCT && (
            <div className="presets-toggle-section">
              <label className="presets-toggle-label">
                <input
                  type="checkbox"
                  checked={showPresets}
                  onChange={(e) => setShowPresets(e.target.checked)}
                />
                <span className="presets-toggle-text">
                  Show CT Presets (recommended for CT only)
                </span>
              </label>
            </div>
          )}

          {(isCT || showPresets) && (
            <div className="presets-section">
              <div className="presets-divider" />
              {WINDOW_PRESETS_BY_CATEGORY.map((category, categoryIndex) => (
                <div key={`category-${categoryIndex}`} className="dropdown-category">
                  <div className="dropdown-category-header">{category.category}</div>
                  {category.presets.map((preset, presetIndex) => (
                    <button
                      key={`${categoryIndex}-${presetIndex}`}
                      className="dropdown-item"
                      onClick={() => handlePresetClick(preset)}
                    >
                      {preset.name}
                      <span className="preset-values">
                        W:{preset.windowWidth} L:{preset.windowCenter}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WindowPresetsDropdown;
