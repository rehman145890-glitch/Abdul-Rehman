import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center gap-1 transition-transform duration-300 ease-in-out hover:scale-105 group ${className}`}>
      <style>
        {`
          .keystone-main-text { fill: #1E2A4D; }
          .dark .keystone-main-text { fill: #E5E7EB; }
          .dark .logo-bg-line { stroke: #030712; }
          .logo-bg-line { stroke: #f9fafb; }
          .keystone-arrow {
            transition: transform 0.3s ease-in-out;
          }
          .group:hover .keystone-arrow {
            transform: translate(2px, -2px);
          }
        `}
      </style>
      <svg width="100" height="65" viewBox="0 0 130 85" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Keystone Logo">
        <defs>
          {/* Gradients for the arch */}
          <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#38A8A8'}} />
            <stop offset="100%" style={{stopColor: '#2A6F6F'}} />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#EAD49A'}} />
            <stop offset="100%" style={{stopColor: '#C7A25B'}} />
          </linearGradient>
          {/* Drop shadow for the arrow */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="1" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Arch for crisp edges */}
        <path d="M30 80 C 10 80, 0 60, 15 40 C 25 20, 45 5, 65 5 C 85 5, 105 20, 115 40 C 130 60, 120 80, 100 80" strokeWidth="16" fill="none" strokeLinecap="round" className="logo-bg-line"/>
        
        {/* Segmented Arch with Gradients */}
        <path d="M30 80 C 10 80, 0 60, 15 40 C 25 20, 45 5, 65 5" stroke="url(#tealGradient)" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d="M65 5 C 85 5, 105 20, 115 40 C 130 60, 120 80, 100 80" stroke="url(#goldGradient)" strokeWidth="10" fill="none" strokeLinecap="round" />

        {/* Arch separators */}
        <line x1="30" y1="80" x2="30" y2="70" strokeWidth="2.5" className="logo-bg-line"/>
        <line x1="100" y1="80" x2="100" y2="70" strokeWidth="2.5" className="logo-bg-line"/>
        <line x1="15" y1="40" x2="22" y2="43" strokeWidth="2.5" className="logo-bg-line"/>
        <line x1="115" y1="40" x2="108" y2="43" strokeWidth="2.5" className="logo-bg-line"/>
        
        {/* K-Arrow with shadow */}
        <g filter="url(#dropShadow)">
           <path d="M42 80 L 42 50 L 65 65 L 88 50 L 65 30 L 42 50 Z" className="keystone-main-text keystone-arrow" />
        </g>
      </svg>
      <div className="text-center -mt-3">
        <span className="text-2xl font-black tracking-tight keystone-main-text">
          KEYSTONE
        </span>
        <br />
        <span style={{ color: '#C7A25B' }} className="text-[8px] font-medium tracking-[0.3em] -mt-1 block">
          WEBSITE
        </span>
      </div>
    </div>
  );
};

export default Logo;