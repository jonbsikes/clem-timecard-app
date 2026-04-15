// Lightweight inline SVG icons (no external deps). Keep stroke-based for crisp scaling.
import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function base(props: IconProps) {
  const { size = 24, ...rest } = props;
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export const IconHistory = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconDocs = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h7M9 17h7" />
  </svg>
);

export const IconUser = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const IconBuilding = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="3" width="16" height="18" rx="1" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    <path d="M10 21v-3h4v3" />
  </svg>
);

// Projects: horizon landscape with a setting sun and trees
export const IconProjects = (p: IconProps) => (
  <svg {...base(p)}>
    {/* sun on the horizon */}
    <circle cx="12" cy="15" r="3.2" />
    {/* horizon line */}
    <path d="M2 15h20" />
    {/* sun rays above horizon */}
    <path d="M12 9.5v1.5M7.5 11.5l1 1M16.5 11.5l-1 1" />
    {/* left tree (pine) */}
    <path d="M5 15l2-4 2 4z" />
    <path d="M7 15v2.5" />
    {/* right tree (pine) */}
    <path d="M16 15l2.2-4.5 2.2 4.5z" />
    <path d="M18.2 15v2.5" />
    {/* ground */}
    <path d="M3 19h18" />
  </svg>
);

// Work Types: construction worker with a shovel
export const IconWrench = (p: IconProps) => (
  <svg {...base(p)}>
    {/* hard hat */}
    <path d="M7.5 7.5a3.5 3.5 0 0 1 7 0" />
    <path d="M6.5 7.5h9" />
    {/* head */}
    <circle cx="11" cy="10" r="2" />
    {/* body */}
    <path d="M11 12v5" />
    {/* arms - one holding shovel */}
    <path d="M11 13l3.5 2" />
    <path d="M11 13l-2.5 2" />
    {/* legs */}
    <path d="M11 17l-2 4M11 17l2 4" />
    {/* shovel handle */}
    <path d="M14.5 15l4.5-4.5" />
    {/* shovel blade */}
    <path d="M19 10.5l2.5 2.5-1.5 1.5-2.5-2.5z" />
  </svg>
);

// Equipment: skid steer loader
export const IconTruck = (p: IconProps) => (
  <svg {...base(p)}>
    {/* cab */}
    <path d="M8 6h7a1 1 0 0 1 1 1v7H8z" />
    {/* cab window detail */}
    <path d="M10 8h4v3h-4z" />
    {/* lift arm */}
    <path d="M16 8l5 3" />
    {/* bucket */}
    <path d="M21 10v3l-3 1v-3z" />
    {/* chassis */}
    <path d="M4 14h14v3H4z" />
    {/* tracks/wheels */}
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="15" cy="18" r="1.6" />
  </svg>
);

export const IconPeople = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <circle cx="17" cy="9" r="3" />
    <path d="M15 20a5 5 0 0 1 6.5-4.8" />
  </svg>
);

export const IconGear = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconShield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
