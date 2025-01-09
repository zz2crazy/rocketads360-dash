import React from 'react';
import { Rocket } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Rocket className="h-8 w-8 text-primary mr-3" />
      <span className="font-extrabold text-2xl tracking-tight">
        <span className="text-primary">Rocket</span>
        <span className="text-foreground">Ads</span>
        <span className="text-accent">360</span>
      </span>
    </div>
  );
}