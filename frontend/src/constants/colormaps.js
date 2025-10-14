/**
 * Colormaps available in Cornerstone3D
 * Sources:
 * 1. CPU colormaps from cornerstone3D-github-original/packages/core/src/constants/cpuColormaps.ts
 * 2. VTK.js colormaps via vtkColorMaps.rgbPresetNames
 * Reference: cornerstone3D-github-original/packages/tools/examples/changeColormap/index.ts
 */

export const COMMON_COLORMAPS = [
  // From Cornerstone3D CPU colormaps (DICOM standard)
  { name: 'Hot Iron', label: 'Hot Iron' },
  { name: 'PET', label: 'PET' },
  { name: 'Hot Metal Blue', label: 'Hot Metal Blue' },
  { name: 'PET 20 Step', label: 'PET 20 Step' },

  // From CPU colormaps (matplotlib)
  { name: 'Gray', label: 'Gray' },
  { name: 'Jet', label: 'Jet' },
  { name: 'HSV', label: 'HSV' },
  { name: 'Hot', label: 'Hot' },
  { name: 'Cool', label: 'Cool' },
  { name: 'Spring', label: 'Spring' },
  { name: 'Summer', label: 'Summer' },
  { name: 'Autumn', label: 'Autumn' },
  { name: 'Winter', label: 'Winter' },
  { name: 'Bone', label: 'Bone' },
  { name: 'Copper', label: 'Copper' },
  { name: 'Spectral', label: 'Spectral' },
  { name: 'CoolWarm', label: 'Cool-Warm' },
  { name: 'Blues', label: 'Blues' },
];
