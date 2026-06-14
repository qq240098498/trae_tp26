import React from 'react';
import { CareMethod } from '@/types/garment';
import { Droplets, Wind, Thermometer, Ban, Flame } from 'lucide-react';

const CARE_CONFIG: Record<CareMethod, { icon: React.ReactNode; bgClass: string; label: string }> = {
  '水洗': {
    icon: <Droplets className="w-3.5 h-3.5" />,
    bgClass: 'bg-sky-50 text-sky-700 border-sky-200',
    label: '水洗',
  },
  '干洗': {
    icon: <Wind className="w-3.5 h-3.5" />,
    bgClass: 'bg-violet-50 text-violet-700 border-violet-200',
    label: '干洗',
  },
  '水温≤30°': {
    icon: <Thermometer className="w-3.5 h-3.5" />,
    bgClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    label: '水温≤30°',
  },
  '不可漂白': {
    icon: <Ban className="w-3.5 h-3.5" />,
    bgClass: 'bg-red-50 text-red-700 border-red-200',
    label: '不可漂白',
  },
  '不可烘干': {
    icon: <Ban className="w-3.5 h-3.5" />,
    bgClass: 'bg-orange-50 text-orange-700 border-orange-200',
    label: '不可烘干',
  },
  '低温熨烫': {
    icon: <Flame className="w-3.5 h-3.5" />,
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    label: '低温熨烫',
  },
  '中温熨烫': {
    icon: <Flame className="w-3.5 h-3.5" />,
    bgClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    label: '中温熨烫',
  },
  '高温熨烫': {
    icon: <Flame className="w-3.5 h-3.5" />,
    bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
    label: '高温熨烫',
  },
};

interface CareMethodBadgeProps {
  method: CareMethod;
  size?: 'sm' | 'md' | 'lg';
}

export default function CareMethodBadge({ method, size = 'sm' }: CareMethodBadgeProps) {
  const config = CARE_CONFIG[method];
  if (!config) return null;

  const sizeClass = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  }[size];

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-pill border font-medium ${config.bgClass} ${sizeClass} transition-all duration-200`}
    >
      {React.cloneElement(config.icon as React.ReactElement, { className: iconSize })}
      {config.label}
    </span>
  );
}
