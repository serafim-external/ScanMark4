/**
 * Colormaps available in Cornerstone3D
 * Sources:
 * 1. CPU colormaps from cornerstone3D-github-original/packages/core/src/constants/cpuColormaps.ts
 * 2. VTK.js colormaps via vtkColorMaps.rgbPresetNames
 * Reference:
 * - cornerstone3D-github-original/packages/core/examples/stackAPI/index.ts (uses 'hsv')
 * - cornerstone3D-github-original/packages/tools/examples/changeColormap/index.ts
 */

export const COMMON_COLORMAPS = [
  // From official stackAPI example - uses lowercase
  { name: 'hsv', label: 'HSV' },

  // Common matplotlib colormaps (lowercase to match vtk.js presets)
  { name: 'hot', label: 'Hot' },
  { name: 'cool', label: 'Cool' },
  { name: 'spring', label: 'Spring' },
  { name: 'summer', label: 'Summer' },
  { name: 'autumn', label: 'Autumn' },
  { name: 'winter', label: 'Winter' },
  { name: 'bone', label: 'Bone' },
  { name: 'copper', label: 'Copper' },
  { name: 'jet', label: 'Jet' },

  // Scientific colormaps
  { name: 'viridis', label: 'Viridis' },
  { name: 'plasma', label: 'Plasma' },
  { name: 'inferno', label: 'Inferno' },
  { name: 'magma', label: 'Magma' },

  // Diverging colormaps
  { name: 'coolwarm', label: 'Cool-Warm' },
  { name: 'rainbow', label: 'Rainbow' },

  // Grayscale
  { name: 'gray', label: 'Grayscale' },
  { name: 'erdc_rainbow_bright', label: 'Rainbow Bright' },
];
