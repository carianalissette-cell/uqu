import React from 'react';

interface MacBookFrameProps {
  children: React.ReactNode;
  brightness: number;
  powerPhase: 'boot' | 'lock' | 'desktop';
}

export const MacBookFrame: React.FC<MacBookFrameProps> = ({
  children,
  brightness,
  powerPhase,
}) => {
  const dimOpacity = Math.max(0, Math.min(0.65, (100 - brightness) / 140));

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-neutral-950 p-0 sm:p-2 md:p-3 overflow-hidden">
      {/* MacBook Air Aluminum Lid & Screen Bezel */}
      <div className="relative flex h-full w-full max-w-[1440px] flex-col overflow-hidden rounded-none sm:rounded-[18px] border border-neutral-700/70 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
        {/* Top slim bezel with centered MacBook Air camera notch */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center">
          <div className="flex h-[22px] w-[144px] items-center justify-center gap-2 rounded-b-[10px] bg-black shadow-sm">
            <span className="h-2 w-2 rounded-full bg-neutral-800 ring-1 ring-neutral-700/80 flex items-center justify-center">
              <span className="h-1 w-1 rounded-full bg-sky-950" />
            </span>
          </div>
        </div>

        {/* Display Panel */}
        <div
          className="relative flex-1 w-full h-full overflow-hidden bg-black"
          data-testid="macbook-screen"
          data-phase={powerPhase}
        >
          {children}

          {/* Hardware Screen Brightness Overlay */}
          {dimOpacity > 0 && (
            <div
              className="pointer-events-none absolute inset-0 z-[999] bg-black transition-opacity duration-150"
              style={{ opacity: dimOpacity }}
            />
          )}
        </div>

        {/* Subtle MacBook Air bottom display chin */}
        <div className="hidden sm:flex h-4 w-full shrink-0 items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 border-t border-neutral-800/80">
          <span className="text-[9px] font-medium tracking-[0.22em] text-neutral-500">
            MacBook Air
          </span>
        </div>
      </div>
    </div>
  );
};
