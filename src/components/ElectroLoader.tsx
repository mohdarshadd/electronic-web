const SIZES = { sm: 64, md: 120 } as const;

export type ElectroLoaderProps = {
  size?: keyof typeof SIZES;
  label?: string;
};

export default function ElectroLoader({ size = "md" }: ElectroLoaderProps) {
  const px = SIZES[size];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <svg
        width={px}
        height={px}
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden
      >
        <path
          className="loader-trace"
          d="M10 28 H36 V54 H46"
          stroke="#a5b4fc"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="loader-trace"
          d="M10 92 H36 V66 H46"
          stroke="#a5b4fc"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="loader-trace"
          d="M110 28 H84 V54 H74"
          stroke="#a5b4fc"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="loader-trace"
          d="M110 92 H84 V66 H74"
          stroke="#a5b4fc"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="0"
          cy="0"
          r="3"
          className="fill-indigo-500 loader-electron"
        />
        <circle
          cx="0"
          cy="0"
          r="3"
          className="fill-indigo-500 loader-electron electron-2"
        />
        <circle
          cx="0"
          cy="0"
          r="3"
          className="fill-indigo-500 loader-electron electron-3"
        />
        <circle
          cx="0"
          cy="0"
          r="3"
          className="fill-indigo-500 loader-electron electron-4"
        />
        <circle cx="10" cy="28" r="3.5" className="fill-indigo-400 loader-led" />
        <circle cx="10" cy="92" r="3.5" className="fill-indigo-400 loader-led" />
        <circle
          cx="110"
          cy="28"
          r="3.5"
          className="fill-indigo-400 loader-led"
        />
        <circle
          cx="110"
          cy="92"
          r="3.5"
          className="fill-indigo-400 loader-led"
        />
        <g className="loader-chip">
          <rect
            x="46"
            y="46"
            width="28"
            height="28"
            rx="6"
            className="fill-indigo-600"
          />
          <path d="M62 52 54 64h6l-2 8 8-12h-6l2-8z" className="fill-white" />
        </g>
      </svg>
    </div>
  );
}
