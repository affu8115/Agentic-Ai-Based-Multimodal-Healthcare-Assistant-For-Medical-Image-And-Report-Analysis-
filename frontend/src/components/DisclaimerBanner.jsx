import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner = () => {
  return (
    <div className="disclaimer-banner">
      <AlertTriangle size={16} />
      <span>
        <strong>Medical Safety Disclaimer:</strong> This system is an educational and clinical decision-support prototype. 
        It does <strong>NOT</strong> provide a confirmed medical diagnosis or replace a qualified healthcare professional.
      </span>
    </div>
  );
};
