import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame } from 'lucide-react';

export const TriageBadge = ({ level, color }) => {
  const lvl = level || 'Tier 1: General Information';

  if (lvl.includes('Tier 4') || color === 'rose') {
    return (
      <span className="badge badge-rose">
        <Flame size={14} /> {lvl}
      </span>
    );
  }
  if (lvl.includes('Tier 3') || color === 'orange') {
    return (
      <span className="badge badge-orange">
        <AlertTriangle size={14} /> {lvl}
      </span>
    );
  }
  if (lvl.includes('Tier 2') || color === 'amber') {
    return (
      <span className="badge badge-amber">
        <AlertCircle size={14} /> {lvl}
      </span>
    );
  }
  return (
    <span className="badge badge-emerald">
      <ShieldCheck size={14} /> {lvl}
    </span>
  );
};

