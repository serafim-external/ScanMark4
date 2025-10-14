// Window presets based on standard medical imaging values
// Format: { windowWidth, windowCenter } which will be converted to VOIRange

export const WINDOW_PRESETS = {
  // Head and Neck
  brain: {
    name: 'Brain',
    windowWidth: 80,
    windowCenter: 40,
  },
  subdural: {
    name: 'Subdural',
    windowWidth: 200, // средн значение между 130-300
    windowCenter: 75,  // среднее значение между 50-100
  },
  stroke: {
    name: 'Stroke',
    windowWidth: 40,
    windowCenter: 40,
  },
  temporalBones: {
    name: 'Temporal Bones',
    windowWidth: 3400, // среднее между 2800 и 4000
    windowCenter: 650,  // среднее между 600 и 700
  },
  softTissues: {
    name: 'Soft Tissues (Head)',
    windowWidth: 375,  // среднее между 350-400
    windowCenter: 40,   // среднее между 20-60
  },

  // Chest
  lungs: {
    name: 'Lungs',
    windowWidth: 1500,
    windowCenter: -600,
  },
  mediastinum: {
    name: 'Mediastinum',
    windowWidth: 350,
    windowCenter: 50,
  },
  vascular: {
    name: 'Vascular/Heart',
    windowWidth: 600,
    windowCenter: 200,
  },

  // Abdomen
  abdomenSoftTissues: {
    name: 'Abdomen Soft Tissues',
    windowWidth: 400,
    windowCenter: 50,
  },
  liver: {
    name: 'Liver',
    windowWidth: 150,
    windowCenter: 30,
  },

  // Spine
  spineSoftTissues: {
    name: 'Spine Soft Tissues',
    windowWidth: 250,
    windowCenter: 50,
  },
  bone: {
    name: 'Bone',
    windowWidth: 1800,
    windowCenter: 400,
  },
};

// Organized presets by category for dropdown menu
export const WINDOW_PRESETS_BY_CATEGORY = [
  {
    category: 'Head & Neck',
    presets: [
      WINDOW_PRESETS.brain,
      WINDOW_PRESETS.subdural,
      WINDOW_PRESETS.stroke,
      WINDOW_PRESETS.temporalBones,
      WINDOW_PRESETS.softTissues,
    ],
  },
  {
    category: 'Chest',
    presets: [
      WINDOW_PRESETS.lungs,
      WINDOW_PRESETS.mediastinum,
      WINDOW_PRESETS.vascular,
    ],
  },
  {
    category: 'Abdomen',
    presets: [
      WINDOW_PRESETS.abdomenSoftTissues,
      WINDOW_PRESETS.liver,
    ],
  },
  {
    category: 'Spine & Bone',
    presets: [
      WINDOW_PRESETS.spineSoftTissues,
      WINDOW_PRESETS.bone,
    ],
  },
];
