/**
 * The phone view's icon set — the Material glyphs the original app used,
 * drawn inline so the packaged app carries no icon font and no network call.
 */

type IconProps = { className?: string };

function Svg({
  children,
  className,
  filled = false,
}: IconProps & { children: React.ReactNode; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className ?? "size-6"}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </Svg>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <Svg {...props} filled>
      <circle cx="12" cy="5" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="12" cy="19" r="1.9" />
    </Svg>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 12H4m0 0 6-6m-6 6 6 6" />
    </Svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    </Svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.6v.2" />
    </Svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </Svg>
  );
}

export function TextSizeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 18 7 6l5 12M3.6 14.4h6.8" />
      <path d="M13.5 18 17 9l3.5 9M14.7 15.4h4.6" />
    </Svg>
  );
}

/* The three share targets. Simplified marks, drawn to read at 20px rather
   than to reproduce anyone's trademark artwork. */

export function WhatsAppIcon(props: IconProps) {
  return (
    <Svg {...props} filled>
      <path d="M12 2.2a9.7 9.7 0 0 0-8.3 14.7L2.2 22l5.3-1.4A9.7 9.7 0 1 0 12 2.2m0 1.8a7.9 7.9 0 1 1-4.1 14.6l-.3-.2-3 .8.8-2.9-.2-.3A7.9 7.9 0 0 1 12 4" />
      <path d="M9.3 7.4c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4s-.9.9-.9 2.1.9 2.5 1 2.6.8 2.9 3.7 4c2.4.9 2.9.7 3.4.7s1.6-.6 1.8-1.3.2-1.2.2-1.3-.2-.2-.4-.3l-1.7-.8c-.2-.1-.4-.2-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.2-.2 0-.4.1-.5l.4-.5.3-.4v-.4z" />
    </Svg>
  );
}

/** X, formerly Twitter — the mark is two crossing strokes. */
export function XIcon(props: IconProps) {
  return (
    <Svg {...props} filled>
      <path d="M17.2 3h3.3l-7.2 8.2L21.8 21h-6.6l-4.4-5.7L5.7 21H2.4l7.7-8.8L2.5 3h6.8l4 5.3zm-1.2 16h1.8L8.1 4.9H6.1z" />
    </Svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <Svg {...props} filled>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9l2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 22 12" />
    </Svg>
  );
}

export function ContrastIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" stroke="none" />
    </Svg>
  );
}
