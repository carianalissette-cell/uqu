import React, { useEffect, useState } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(4);
  const [powered, setPowered] = useState(false);

  useEffect(() => {
    const powerTimer = window.setTimeout(() => {
      setPowered(true);
    }, 180);

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        const step = prev < 45 ? 9 : prev < 80 ? 7 : 12;
        return Math.min(100, prev + step);
      });
    }, 95);

    const finishTimer = window.setTimeout(() => {
      onComplete();
    }, 1550);

    return () => {
      window.clearTimeout(powerTimer);
      window.clearInterval(interval);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-black text-white"
      data-testid="boot-screen"
    >
      <div
        className={`flex flex-col items-center gap-10 transition-opacity duration-500 ${
          powered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Crisp Minimalist Apple Silhouette SVG */}
        <svg
          viewBox="0 0 170 170"
          className="h-20 w-20 fill-white"
          aria-hidden="true"
        >
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.13-1.9-14.34-6.08-3.69-3.03-7.61-7.79-11.77-14.28-5.04-7.82-9.16-16.86-12.35-27.13-3.19-10.27-4.79-19.99-4.79-29.17 0-10.97 2.75-20.1 8.26-27.39 5.51-7.29 12.63-11.12 21.37-11.49 4.71 0 10.09 1.38 16.14 4.12 6.05 2.75 9.95 4.16 11.7 4.24 1.34 0 5.56-1.63 12.65-4.88 7.09-3.25 13.08-4.63 17.98-4.14 13.45 1.09 23.56 6.4 30.33 15.92-12.01 7.28-17.91 17.46-17.71 30.52.22 10.18 4.15 18.67 11.79 25.47 5.26 4.78 11.41 7.66 18.46 8.64-1.46 4.44-3.14 8.71-5.04 12.82zM119.22 31.01c0 7.99-2.92 15.44-8.75 22.34-7.03 8.24-15.53 12.99-24.75 12.24-.14-.99-.21-2.04-.21-3.17 0-7.67 3.31-15.86 9.19-22.58 2.94-3.38 6.67-6.19 11.21-8.43 4.53-2.23 8.83-3.47 12.9-3.71.27 1.15.41 2.25.41 3.31z" />
        </svg>

        {/* macOS Boot Progress Bar */}
        <div
          className="h-1.5 w-52 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-label="Iniciando MacBook Air"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-white transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
