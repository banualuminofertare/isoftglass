import { useEffect, useState } from 'react';
import splashLogo from '@/assets/splash-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    const exitTimer = setTimeout(() => setPhase('exit'), 2600);
    const completeTimer = setTimeout(() => onComplete(), 3200);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#1a2540] transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <img
        src={splashLogo}
        alt="iSoft Glass"
        className="splash-logo w-full h-full object-cover select-none"
        draggable={false}
      />
      {/* Shine sweep over the text area */}
      <div className="absolute bottom-[28%] left-0 right-0 h-[50px] overflow-hidden pointer-events-none">
        <div className="splash-text-flash absolute inset-0" />
      </div>
    </div>
  );
}
