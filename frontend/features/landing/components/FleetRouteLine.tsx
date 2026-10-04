type FleetRouteLineProps = {
  placement: "top" | "bottom";
};

const routePath =
  "M -16 56 C 140 84, 278 18, 446 46 S 728 80, 912 40 S 1198 20, 1456 54";

export function FleetRouteLine({ placement }: FleetRouteLineProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-0 w-full overflow-hidden ${
        placement === "top" ? "top-0" : "bottom-0 -scale-y-100"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        focusable="false"
        role="presentation"
        className="w-full h-[clamp(48px,6.8vw,96px)] block"
      >
        <defs>
          <linearGradient id="fleet-route-gradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#041131" stopOpacity="0" />
            <stop offset="0.16" stopColor="#195CF1" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="#60A5FA" stopOpacity="0.7" />
            <stop offset="0.82" stopColor="#195CF1" stopOpacity="0.35" />
            <stop offset="1" stopColor="#041131" stopOpacity="0" />
          </linearGradient>
          <filter id="fleet-route-glow" x="-10%" y="-70%" width="120%" height="240%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id="fleet-route-node-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <path
          d={routePath}
          filter="url(#fleet-route-glow)"
          fill="none"
          stroke="url(#fleet-route-gradient)"
          strokeLinecap="round"
          strokeWidth="5"
          className="opacity-[0.26]"
        />
        <path
          d={routePath}
          fill="none"
          stroke="url(#fleet-route-gradient)"
          strokeLinecap="round"
          strokeWidth="1"
          className="opacity-[0.76]"
        />

        <g>
          <circle cx="236" cy="34" r="6" filter="url(#fleet-route-node-glow)" fill="#60A5FA" className="opacity-[0.22]" />
          <circle cx="236" cy="34" r="1.8" fill="#93C5FD" className="opacity-[0.82]" />
          <circle cx="586" cy="60" r="5" filter="url(#fleet-route-node-glow)" fill="#60A5FA" className="opacity-[0.22]" />
          <circle cx="586" cy="60" r="1.5" fill="#93C5FD" className="opacity-[0.82]" />
          <circle cx="986" cy="29" r="6" filter="url(#fleet-route-node-glow)" fill="#60A5FA" className="opacity-[0.22]" />
          <circle cx="986" cy="29" r="1.8" fill="#93C5FD" className="opacity-[0.82]" />
          <circle cx="1270" cy="40" r="5" fill="#60A5FA" className="animate-fleet-pulse" />
          <circle cx="1270" cy="40" r="1.6" fill="#93C5FD" className="opacity-[0.82]" />
        </g>
      </svg>
    </div>
  );
}
