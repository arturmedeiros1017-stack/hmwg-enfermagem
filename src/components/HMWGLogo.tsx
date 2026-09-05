import React from 'react';

interface HMWGLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'print';
  showText?: boolean;
  inverted?: boolean;
}

export const HMWGLogo: React.FC<HMWGLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  inverted = false,
}) => {
  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-10 h-10',
    md: 'w-13 h-13',
    lg: 'w-18 h-18',
    xl: 'w-24 h-24',
    print: 'w-16 h-16',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative flex-shrink-0 ${currentSize} rounded-full overflow-hidden shadow-sm border border-cyan-100 bg-white p-0.5`}>
        <img
          src="/hmwg-logo.webp"
          alt="Hospital Monsenhor Walfredo Gurgel"
          className="w-full h-full object-contain rounded-full"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.endsWith('.webp')) {
              target.src = '/hmwg-logo.png';
            } else if (target.src.endsWith('.png')) {
              target.src = '/hmwg-logo.jpg';
            }
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-black tracking-tight ${size === 'lg' || size === 'xl' ? 'text-xl' : 'text-base'} ${inverted ? 'text-white' : 'text-slate-900'}`}>
            HMWG
          </span>
          <span className={`text-xs font-semibold ${inverted ? 'text-cyan-200' : 'text-cyan-800'}`}>
            Hospital Monsenhor Walfredo Gurgel
          </span>
          <span className={`text-[10px] tracking-wider uppercase ${inverted ? 'text-slate-300' : 'text-slate-500'}`}>
            SESAP / Governo do Estado do RN
          </span>
        </div>
      )}
    </div>
  );
};
