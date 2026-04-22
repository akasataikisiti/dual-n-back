import { Stimulus } from '../types';
import { ShapeIcon } from './ShapeIcon';

interface Props {
  size: number;
  activeStimulus: Stimulus | null;
}

export function Board({ size, activeStimulus }: Props) {
  const cells = size * size;
  const cellSize = size === 3 ? 90 : size === 4 ? 72 : 60;

  return (
    <div
      className="board"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
        gap: '6px',
      }}
    >
      {Array.from({ length: cells }, (_, i) => {
        const isActive = activeStimulus?.position === i;
        return (
          <div
            key={i}
            className={`board-cell${isActive ? ' board-cell--active' : ''}`}
            style={{ width: cellSize, height: cellSize }}
          >
            {isActive && (
              <ShapeIcon
                shape={activeStimulus.shape}
                color={activeStimulus.color}
                size={cellSize - 16}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
