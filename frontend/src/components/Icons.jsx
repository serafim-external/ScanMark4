const Icon = ({ size = 20, color = 'currentColor', children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const LayoutIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
  </Icon>
);

export const ZoomIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
    <path d="M21 21l-6 -6" />
  </Icon>
);

export const FolderIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
  </Icon>
);

export const ServerIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" />
    <path d="M3 12m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" />
    <path d="M7 8l0 .01" />
    <path d="M7 16l0 .01" />
  </Icon>
);

export const PanIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M8 11l-1 1l1 1" />
    <path d="M11 8l1 -1l1 1" />
    <path d="M16 11l1 1l-1 1" />
    <path d="M11 16l1 1l1 -1" />
  </Icon>
);

export const WindowLevelIcon = ({ size, color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill={color || 'currentColor'}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336m-9 1.732a8 8 0 0 0 4.001 14.928l-.001 -16a8 8 0 0 0 -4 1.072" />
  </svg>
);

export const StackScrollIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M12 4l-8 4l8 4l8 -4l-8 -4" fill={color || 'currentColor'} />
    <path d="M8 14l-4 2l8 4l8 -4l-4 -2" />
    <path d="M8 10l-4 2l8 4l8 -4l-4 -2" />
  </Icon>
);

export const NextImageIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M10 18l6 -6l-6 -6v12" />
  </Icon>
);

export const PreviousImageIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M14 6l-6 6l6 6v-12" />
  </Icon>
);

export const FlipHorizontalIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M12 3l0 18" />
    <path d="M16 7l0 10l5 0l-5 -10" />
    <path d="M8 7l0 10l-5 0l5 -10" />
  </Icon>
);

export const FlipVerticalIcon = ({ size, color }) => (
  <Icon size={size} color={color}>
    <path d="M3 12l18 0" />
    <path d="M7 16l10 0l-10 5l0 -5" />
    <path d="M7 8l10 0l-10 -5l0 5" />
  </Icon>
);

export const RotateRightIcon = ({ size, color }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 1024 1024"
    fill={color || 'currentColor'}
  >
    <path d="M480.5 251.2c13-1.6 25.9-2.4 38.8-2.5v63.9c0 6.5 7.5 10.1 12.6 6.1L660 217.6c4-3.2 4-9.2 0-12.3l-128-101c-5.1-4-12.6-0.4-12.6 6.1l-0.2 64c-118.6 0.5-235.8 53.4-314.6 154.2-69.6 89.2-95.7 198.6-81.1 302.4h74.9c-0.9-5.3-1.7-10.7-2.4-16.1-5.1-42.1-2.1-84.1 8.9-124.8 11.4-42.2 31-81.1 58.1-115.8 27.2-34.7 60.3-63.2 98.4-84.3 37-20.6 76.9-33.6 119.1-38.8z" />
    <path d="M880 418H352c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32z m-44 402H396V494h440v326z" />
  </svg>
);
