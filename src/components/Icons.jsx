// Shared inline SVG icons.
const stroke = { fill: 'none', stroke: 'currentColor' };

export const GithubIcon = props => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
);

export const MailIcon = ({ strokeWidth = 2, ...props }) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={strokeWidth} {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
);

export const BriefcaseIcon = props => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2" {...props}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
);

export const SendIcon = props => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2" {...props}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
);

export const CodeIcon = ({ strokeWidth = 2, ...props }) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={strokeWidth} {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);

export const RobotIcon = ({ strokeWidth = 1.5, ...props }) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={strokeWidth} {...props}><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M12 3v4M8 7h8M7 11V9a5 5 0 0 1 10 0v2" /><circle cx="9" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></svg>
);

export const SunIcon = props => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2" {...props}><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
);

export const MoonIcon = props => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
);

export const PlusIcon = props => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2.5" {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);

export const DownloadIcon = props => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2.5" {...props}><path d="M12 3v12" /><polyline points="6 10 12 16 18 10" /><path d="M4 20h16" /></svg>
);

export const VolumeOnIcon = props => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2" {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

export const VolumeOffIcon = props => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2" {...props}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </svg>
);
