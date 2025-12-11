import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  text?: string;
  className?: string; // Allow custom classes for positioning if needed
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  text = "טוען...", 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-gray-500 ${className}`}>
      {/* - animate-spin: Tailwind utility for infinite rotation 
        - text-blue-600: Matches your app's primary color
      */}
      <Loader2 size={48} className="animate-spin text-blue-600" strokeWidth={1.5} />
      
      {/* animate-pulse adds a subtle fading effect to the text */}
      <span className="text-lg font-medium animate-pulse">{text}</span>
    </div>
  );
};

export default LoadingIndicator;