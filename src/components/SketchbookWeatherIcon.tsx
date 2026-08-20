import React from 'react';
import { motion } from 'motion/react';
import { ThemePalette } from '../types';

export type WeatherConditionType = 
  | 'clear' 
  | 'clear-night' 
  | 'partly-cloudy' 
  | 'cloudy' 
  | 'drizzle' 
  | 'rain' 
  | 'thunderstorm' 
  | 'fog' 
  | 'windy';

interface SketchbookWeatherIconProps {
  weatherCode?: number;
  condition?: WeatherConditionType;
  isDay?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: ThemePalette;
  className?: string;
  animated?: boolean;
  interactive?: boolean;
}

/**
 * Resolves WMO weather code to standard condition type
 */
export function resolveWeatherCondition(code?: number, isDay: boolean = true): WeatherConditionType {
  if (code === undefined || code === null) {
    return isDay ? 'clear' : 'clear-night';
  }
  
  switch (code) {
    case 0:
      return isDay ? 'clear' : 'clear-night';
    case 1:
    case 2:
      return 'partly-cloudy';
    case 3:
      return 'cloudy';
    case 45:
    case 48:
      return 'fog';
    case 51:
    case 53:
    case 55:
      return 'drizzle';
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return 'rain';
    case 95:
    case 96:
    case 99:
      return 'thunderstorm';
    default:
      return isDay ? 'clear' : 'clear-night';
  }
}

export const SketchbookWeatherIcon: React.FC<SketchbookWeatherIconProps> = ({
  weatherCode,
  condition,
  isDay = true,
  size = 'md',
  theme = 'golden',
  className = '',
  animated = true,
  interactive = true
}) => {
  const resolvedCondition = condition || resolveWeatherCondition(weatherCode, isDay);
  const isTwilight = theme === 'twilight';

  // Dimension mapping
  const sizePx = {
    xs: 20,
    sm: 28,
    md: 40,
    lg: 56,
    xl: 76
  }[size];

  // Hand-drawn sketch color palette
  const strokeColor = isTwilight ? '#cbd5e1' : '#4a3b32';
  const sunColor = isTwilight ? '#fcd34d' : '#d97706';
  const sunRayColor = isTwilight ? '#fbbf24' : '#e58e26';
  const moonColor = isTwilight ? '#7dd3fc' : '#f59e0b';
  const cloudFill = isTwilight ? '#1e293b' : '#f5ede0';
  const cloudStroke = isTwilight ? '#94a3b8' : '#6b584d';
  const rainColor = isTwilight ? '#38bdf8' : '#3b82f6';
  const lightningColor = isTwilight ? '#fde047' : '#eab308';
  const fogColor = isTwilight ? '#64748b' : '#9c8e82';

  const renderIconContent = () => {
    switch (resolvedCondition) {
      case 'clear':
        return (
          <g>
            {/* Soft watercolor aura */}
            <motion.circle
              cx="24"
              cy="24"
              r="15"
              fill={sunColor}
              opacity={isTwilight ? 0.12 : 0.15}
              animate={animated ? { scale: [1, 1.08, 1] } : undefined}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Hand-drawn Sun Core */}
            <motion.circle
              cx="24"
              cy="24"
              r="8"
              fill="none"
              stroke={sunColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="48"
              strokeDashoffset="0"
              animate={animated ? { rotate: [0, 5, -5, 0] } : undefined}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Sun core inner sketch dot */}
            <circle cx="24" cy="24" r="3.5" fill={sunColor} opacity={0.8} />

            {/* Hand-drawn Sun Rays (radiating organic strokes) */}
            <motion.g
              animate={animated ? { rotate: 360 } : undefined}
              transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "24px 24px" }}
            >
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
                <motion.line
                  key={angle}
                  x1="24"
                  y1="11"
                  x2="24"
                  y2={idx % 2 === 0 ? "7" : "8.5"}
                  stroke={sunRayColor}
                  strokeWidth={idx % 2 === 0 ? "2" : "1.5"}
                  strokeLinecap="round"
                  transform={`rotate(${angle} 24 24)`}
                  animate={animated ? { 
                    y2: idx % 2 === 0 ? ["7px", "6px", "7px"] : ["8.5px", "7.5px", "8.5px"],
                    opacity: [0.8, 1, 0.8]
                  } : undefined}
                  transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.15, ease: "easeInOut" }}
                />
              ))}
            </motion.g>
          </g>
        );

      case 'clear-night':
        return (
          <g>
            {/* Hand-drawn Crescent Moon */}
            <motion.path
              d="M27.5 13.5 C20 14.5 14.5 21 15 28.5 C15.5 35 21.5 40 28.5 39 C24 35.5 22.5 29 25 23.5 C26.8 19.5 29.5 17 31.5 16 C30 14.8 28.8 14 27.5 13.5 Z"
              fill={isTwilight ? 'rgba(125, 211, 252, 0.15)' : 'rgba(245, 158, 11, 0.12)'}
              stroke={moonColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={animated ? { 
                rotate: [-2, 3, -2],
                y: [0, -1, 0]
              } : undefined}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "24px 24px" }}
            />
            {/* Sketched twinkle stars */}
            <motion.path
              d="M34 16 L35 18 L37 19 L35 20 L34 22 L33 20 L31 19 L33 18 Z"
              fill={isTwilight ? '#38bdf8' : '#f59e0b'}
              strokeWidth="0.5"
              animate={animated ? { scale: [0.7, 1.15, 0.7], opacity: [0.4, 1, 0.4] } : undefined}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "34px 19px" }}
            />
            <motion.circle
              cx="13"
              cy="18"
              r="1.2"
              fill={isTwilight ? '#93c5fd' : '#d97706'}
              animate={animated ? { opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.2, 0.8] } : undefined}
              transition={{ duration: 3, repeat: Infinity, delay: 0.8, ease: "easeInOut" }}
            />
          </g>
        );

      case 'partly-cloudy':
        return (
          <g>
            {/* Sun peeking from behind */}
            <motion.g
              animate={animated ? { 
                y: [0, -1.5, 0],
                rotate: [0, 8, 0]
              } : undefined}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "18px 17px" }}
            >
              <circle
                cx="18"
                cy="17"
                r="6.5"
                fill={sunColor}
                opacity={0.3}
              />
              <circle
                cx="18"
                cy="17"
                r="6.5"
                fill="none"
                stroke={sunColor}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Peek rays */}
              {[-60, -30, 0, 30, 60].map((deg) => (
                <line
                  key={deg}
                  x1="18"
                  y1="7.5"
                  x2="18"
                  y2="5"
                  stroke={sunRayColor}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  transform={`rotate(${deg} 18 17)`}
                />
              ))}
            </motion.g>

            {/* Hand-drawn Sketch Cloud */}
            <motion.path
              d="M17 33 C13.5 33 11 30.5 11 27.5 C11 24.8 13 22.8 15.5 22.2 C16.5 17.8 20.8 14.5 25.8 14.5 C31.2 14.5 35.5 18.2 36.2 23 C38.8 23.4 41 25.5 41 28.2 C41 31.2 38.5 33.5 35.5 33.5 Z"
              fill={cloudFill}
              stroke={cloudStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={animated ? { 
                x: [-1, 1, -1],
                y: [0, -1, 0]
              } : undefined}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Subtle inner sketch texture line */}
            <path
              d="M18 29 C21 27 26 27 30 29"
              fill="none"
              stroke={cloudStroke}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.4"
            />
          </g>
        );

      case 'cloudy':
        return (
          <g>
            {/* Back Cloud (darker/smaller) */}
            <motion.path
              d="M14 26 C11 26 9 24 9 21.5 C9 19.2 10.8 17.5 13 17 C14 13 17.8 10 22 10 C26.8 10 30.5 13.2 31.2 17.5 C33.5 17.8 35.5 19.8 35.5 22 C35.5 24.5 33.5 26.5 31 26.5 Z"
              fill={isTwilight ? '#16233d' : '#eedec8'}
              stroke={cloudStroke}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.75"
              animate={animated ? { x: [1, -1.5, 1] } : undefined}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Front Cloud */}
            <motion.path
              d="M16 35 C12.5 35 10 32.5 10 29.5 C10 26.8 12 24.8 14.5 24.2 C15.5 19.8 19.8 16.5 24.8 16.5 C30.2 16.5 34.5 20.2 35.2 25 C37.8 25.4 40 27.5 40 30.2 C40 33.2 37.5 35.5 34.5 35.5 Z"
              fill={cloudFill}
              stroke={cloudStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={animated ? { 
                x: [-1.2, 1.2, -1.2],
                y: [0, -0.8, 0]
              } : undefined}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Sketch crosshatch accent */}
            <path
              d="M17 31 C21 29.5 26 29.5 30 31"
              fill="none"
              stroke={cloudStroke}
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>
        );

      case 'drizzle':
        return (
          <g>
            {/* Cloud */}
            <motion.path
              d="M16 28 C12.5 28 10 25.5 10 22.5 C10 19.8 12 17.8 14.5 17.2 C15.5 12.8 19.8 9.5 24.8 9.5 C30.2 9.5 34.5 13.2 35.2 18 C37.8 18.4 40 20.5 40 23.2 C40 26.2 37.5 28.5 34.5 28.5 Z"
              fill={cloudFill}
              stroke={cloudStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={animated ? { y: [0, -1, 0] } : undefined}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Hand-drawn Drizzle Drops (gentle small slanted ticks) */}
            {[
              { x: 17, y: 32, delay: 0 },
              { x: 24, y: 33, delay: 0.35 },
              { x: 31, y: 32, delay: 0.7 }
            ].map((drop, i) => (
              <motion.line
                key={i}
                x1={drop.x}
                y1={drop.y}
                x2={drop.x - 2}
                y2={drop.y + 4}
                stroke={rainColor}
                strokeWidth="1.8"
                strokeLinecap="round"
                animate={animated ? {
                  y: [0, 4, 8],
                  opacity: [0, 1, 0]
                } : undefined}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: drop.delay,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        );

      case 'rain':
        return (
          <g>
            {/* Stormy Rain Cloud */}
            <motion.path
              d="M16 26 C12.5 26 10 23.5 10 20.5 C10 17.8 12 15.8 14.5 15.2 C15.5 10.8 19.8 7.5 24.8 7.5 C30.2 7.5 34.5 11.2 35.2 16 C37.8 16.4 40 18.5 40 21.2 C40 24.2 37.5 26.5 34.5 26.5 Z"
              fill={cloudFill}
              stroke={cloudStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={animated ? { y: [0, -1.2, 0] } : undefined}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Continuous Sketched Rain Streaks */}
            {[
              { x: 15, y: 30, len: 7, delay: 0 },
              { x: 22, y: 30, len: 8, delay: 0.25 },
              { x: 29, y: 30, len: 7, delay: 0.5 },
              { x: 35, y: 31, len: 6, delay: 0.15 }
            ].map((drop, i) => (
              <motion.line
                key={i}
                x1={drop.x}
                y1={drop.y}
                x2={drop.x - 3}
                y2={drop.y + drop.len}
                stroke={rainColor}
                strokeWidth="2"
                strokeLinecap="round"
                animate={animated ? {
                  y: [0, 5, 10],
                  opacity: [0, 1, 0]
                } : undefined}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: drop.delay,
                  ease: "linear"
                }}
              />
            ))}
          </g>
        );

      case 'thunderstorm':
        return (
          <g>
            {/* Dark Cloud */}
            <motion.path
              d="M16 25 C12.5 25 10 22.5 10 19.5 C10 16.8 12 14.8 14.5 14.2 C15.5 9.8 19.8 6.5 24.8 6.5 C30.2 6.5 34.5 10.2 35.2 15 C37.8 15.4 40 17.5 40 20.2 C40 23.2 37.5 25.5 34.5 25.5 Z"
              fill={isTwilight ? '#1a233a' : '#ecdcc4'}
              stroke={cloudStroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={animated ? {
                scale: [1, 1.02, 1],
                y: [0, -1, 0]
              } : undefined}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Sketched Lightning Bolt */}
            <motion.path
              d="M26 24 L21 31 L26 31 L22 41 L31 29 L26 29 Z"
              fill={lightningColor}
              stroke={isTwilight ? '#fef08a' : '#ca8a04'}
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              animate={animated ? {
                opacity: [0, 1, 0, 0.9, 0],
                scale: [0.95, 1.05, 0.95, 1, 0.95]
              } : undefined}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                times: [0, 0.08, 0.16, 0.24, 1],
                repeatDelay: 1.2
              }}
              style={{ transformOrigin: "25px 32px" }}
            />

            {/* Rain Drops on side */}
            <motion.line
              x1="14"
              y1="28"
              x2="12"
              y2="34"
              stroke={rainColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              animate={animated ? { y: [0, 6], opacity: [0, 1, 0] } : undefined}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          </g>
        );

      case 'fog':
        return (
          <g>
            {/* Drifting wavy mist layers */}
            {[
              { d: "M10 18 C15 16 20 20 25 18 C30 16 35 20 38 18", strokeWidth: 2, delay: 0 },
              { d: "M7 25 C13 23 18 27 24 25 C30 23 36 27 41 25", strokeWidth: 2.2, delay: 0.5 },
              { d: "M11 32 C16 30 21 34 26 32 C31 30 36 34 39 32", strokeWidth: 2, delay: 1 }
            ].map((line, idx) => (
              <motion.path
                key={idx}
                d={line.d}
                fill="none"
                stroke={fogColor}
                strokeWidth={line.strokeWidth}
                strokeLinecap="round"
                strokeDasharray="2 3"
                animate={animated ? {
                  x: [-2, 2, -2],
                  opacity: [0.45, 0.9, 0.45]
                } : undefined}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: line.delay,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        );

      case 'windy':
        return (
          <g>
            {/* Swirling breeze stroke */}
            <motion.path
              d="M9 22 C18 22 25 22 29 20 C32 18 32 14 29 13 C26 12 24 15 25 17"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              animate={animated ? {
                pathLength: [0.7, 1, 0.7],
                strokeDashoffset: [0, -10, 0]
              } : undefined}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M12 28 C20 28 28 28 32 26 C35 24 36 21 33 19"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.8"
              animate={animated ? { x: [-1.5, 1.5, -1.5] } : undefined}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Small floating leaf accent */}
            <motion.path
              d="M34 32 C37 31 39 33 39 36 C36 36 34 34 34 32 Z"
              fill={isTwilight ? '#34d399' : '#5d6e58'}
              animate={animated ? {
                rotate: [0, 20, -15, 0],
                x: [0, 3, -2, 0],
                y: [0, -2, 2, 0]
              } : undefined}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "36px 34px" }}
            />
          </g>
        );
    }
  };

  return (
    <motion.div
      className={`inline-flex items-center justify-center select-none ${className}`}
      whileHover={interactive ? { scale: 1.1, rotate: 3 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      title={`Weather condition: ${resolvedCondition}`}
    >
      <svg
        width={sizePx}
        height={sizePx}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {renderIconContent()}
      </svg>
    </motion.div>
  );
};
