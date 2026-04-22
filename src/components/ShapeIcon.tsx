import { Shape, Color } from '../types';

const COLOR_MAP: Record<Color, string> = {
  red:    '#FF2D2D',
  blue:   '#1A8FFF',
  green:  '#00DD55',
  yellow: '#FFE000',
  purple: '#CC33FF',
  orange: '#FF7700',
};

function starPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36 - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

interface Props {
  shape: Shape;
  color: Color;
  size?: number;
}

export function ShapeIcon({ shape, color, size = 64 }: Props) {
  const fill = COLOR_MAP[color];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {shape === 'circle' && <circle cx="50" cy="50" r="44" fill={fill} />}
      {shape === 'square' && <rect x="8" y="8" width="84" height="84" rx="6" fill={fill} />}
      {shape === 'triangle' && <polygon points="50,8 94,90 6,90" fill={fill} />}
      {shape === 'star' && <polygon points={starPoints(50, 50, 46, 18)} fill={fill} />}
    </svg>
  );
}
