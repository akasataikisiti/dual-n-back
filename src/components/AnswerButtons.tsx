import { MatchType, MatchConfig, FeedbackMap, FeedbackType, KeyBindings } from '../types';

const LABELS: Record<MatchType, string> = {
  position: '位置',
  shape: '形',
  color: '色',
  sound: '音',
};

const FEEDBACK_CLASS: Record<FeedbackType, string> = {
  hit: 'btn-hit',
  miss: 'btn-miss',
  falseAlarm: 'btn-false-alarm',
  correctReject: '',
};

interface Props {
  matchTypes: MatchConfig;
  userAnswered: MatchConfig;
  feedback: FeedbackMap | null;
  keyBindings: KeyBindings;
  onRespond: (type: MatchType) => void;
  disabled: boolean;
}

export function AnswerButtons({ matchTypes, userAnswered, feedback, keyBindings, onRespond, disabled }: Props) {
  const types: MatchType[] = ['position', 'shape', 'color', 'sound'];

  return (
    <div className="answer-buttons">
      {types.filter(t => matchTypes[t]).map(t => {
        const fb = feedback?.[t];
        const fbClass = fb ? FEEDBACK_CLASS[fb] : '';
        const pressed = userAnswered[t];
        return (
          <button
            key={t}
            className={`answer-btn ${fbClass} ${pressed ? 'answer-btn--pressed' : ''}`}
            onClick={() => onRespond(t)}
            disabled={disabled || pressed}
            title={keyBindings[t].toUpperCase()}
          >
            <span className="answer-btn__label">{LABELS[t]}</span>
            <span className="answer-btn__key">[{keyBindings[t].toUpperCase()}]</span>
            {fb && fb !== 'correctReject' && (
              <span className="answer-btn__feedback">
                {fb === 'hit' ? '✓' : fb === 'miss' ? '○' : '✗'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
