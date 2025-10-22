import React from 'react';
import { BRAND_CONFIG } from '../App';

interface LogoProps {
    className?: string;
    appName?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '', appName = BRAND_CONFIG.appName }) => {
  const brandParts = appName.split(/(OS|os|Os|oS)/).filter(Boolean);
  const mainPart = brandParts[0] || appName;
  const accentPart = brandParts.length > 1 ? brandParts.slice(1).join('') : '';

  return (
    <div className={`flex items-center gap-2 transition-transform duration-300 ease-in-out group ${className}`}>
      <style>
        {`
          .nexusos-main-text { fill: #111827; }
          .dark .nexusos-main-text { fill: #f9fafb; }
          .nexusos-accent-text { fill: #a78bfa; }
          .nexusos-node { transition: transform 0.3s ease-in-out; }
          .group:hover .nexusos-node { transform: scale(1.1); }
          .nexusos-path {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: draw-path 2s ease-in-out forwards;
          }
          @keyframes draw-path {
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label={`${appName} Logo`}>
        <defs>
          <linearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
        </defs>
        <path d="M50 10 V 90 M10 50 H 90" stroke="url(#nexusGradient)" strokeWidth="8" strokeLinecap="round" className="nexusos-path" style={{ animationDelay: '0.2s' }} />
        <path d="M20 20 L 80 80 M20 80 L 80 20" stroke="url(#nexusGradient)" strokeWidth="8" strokeLinecap="round" className="nexusos-path" />
        <circle cx="50" cy="50" r="18" fill="currentColor" className="nexusos-main-text" />
        <circle cx="50" cy="50" r="12" fill="url(#nexusGradient)" className="nexusos-node" />
      </svg>
      <span className="text-2xl font-black tracking-tight nexusos-main-text">
        {mainPart}<span className="nexusos-accent-text">{accentPart}</span>
      </span>
    </div>
  );
};

export default Logo;