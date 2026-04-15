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

// Projects: plot of land (parcel) with a tree and a location pin
export const IconProjects = (p: IconProps) => (
  <svg {...base(p)}>
    {/* parcel / plot outline (diamond) */}
    <path d="M12 4l9 7-9 7-9-7z" />
    {/* path across the plot */}
    <path d="M7 11.5l5 3.5 5-3.5" />
    {/* tree trunk */}
    <path d="M8 11v2" />
    {/* tree canopy */}
    <circle cx="8" cy="9" r="2" />
    {/* location pin */}
    <path d="M15 9.5a1.8 1.8 0 1 1 3.6 0c0 1.4-1.8 3-1.8 3s-1.8-1.6-1.8-3z" />
    <circle cx="16.8" cy="9.5" r="0.6" />
  </svg>
);

// Work Types: construction worker bent over, digging with shovel
export const IconWrench = (p: IconProps) => (
  <svg {...base(p)}>
    {/* hard hat */}
    <path d="M5 6.5a3 3 0 0 1 6 0" />
    <path d="M4 6.5h8" />
    {/* head */}
    <circle cx="8" cy="8.5" r="1.5" />
    {/* bent-over back */}
    <path d="M8.5 10l3 4" />
    {/* front leg */}
    <path d="M11.5 14l-1 6" />
    {/* back leg */}
    <path d="M11.5 14l3 6" />
    {/* arms down to shovel handle */}
    <path d="M10 11l6 5" />
    <path d="M10.8 12.2l5.5 5" />
    {/* shovel handle */}
    <path d="M14 14l4 4" />
    {/* shovel blade */}
    <path d="M17 17l3 1-1 3-3-1z" />
    {/* ground / dirt pile */}
    <path d="M3 21h18" />
    <path d="M13 19.5c1-.8 2-.8 3 0" />
  </svg>
);

// Equipment: skid steer loader (tracked, side view)
export const IconTruck = (p: IconProps) => (
  <svg {...base(p)}>
    {/* cab */}
    <path d="M8 6h6v6H7z" />
    {/* cab window */}
    <path d="M9 7.5h3.5v3H9z" />
    {/* lift arm from cab over to bucket */}
    <path d="M14 7l6 5" />
    {/* bucket */}
    <path d="M20 11.5l2 .5-1 3-2-.5z" />
    {/* chassis body */}
    <path d="M4 12h15v4H4z" />
    {/* track outline */}
    <rect x="3" y="16" width="17" height="3.5" rx="1.75" />
    {/* track rollers */}
    <circle cx="6" cy="17.75" r="0.6" />
    <circle cx="10" cy="17.75" r="0.6" />
    <circle cx="14" cy="17.75" r="0.6" />
    <circle cx="18" cy="17.75" r="0.6" />
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
