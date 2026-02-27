'use client';

import { motion } from 'framer-motion';

interface ProgressCircleProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  subtitle?: string;
}

export function ProgressCircle({
  percentage,
  size = 'md',
  title,
  subtitle,
}: ProgressCircleProps) {
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160,
  };

  const radius = sizeMap[size] / 2;
  const circumference = 2 * Math.PI * (radius - 10);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg
          width={sizeMap[size]}
          height={sizeMap[size]}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 10}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted"
          />

          {/* Progress circle */}
          <motion.circle
            cx={radius}
            cy={radius}
            r={radius - 10}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-primary"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-foreground">
              {percentage}%
            </div>
          </motion.div>
        </div>
      </div>

      {title && (
        <div className="text-center">
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
