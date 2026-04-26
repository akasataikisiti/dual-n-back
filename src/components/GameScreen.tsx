import { useEffect, useCallback, useState } from 'react';
import { GameSettings, MatchType, SessionResult } from '../types';
import { getActiveTypes } from '../utils/gameLogic';
import { getTimings } from '../utils/timing';
import { useGame } from '../hooks/useGame';
import { useAudio } from '../hooks/useAudio';
import { Board } from './Board';
import { AnswerButtons } from './AnswerButtons';

interface Props {
  settings: GameSettings;
  onComplete: (result: SessionResult) => void;
  onQuit: () => void;
}

export function GameScreen({ settings, onComplete, onQuit }: Props) {
  const audio = useAudio();
  const { phase, trialIndex, currentStimulus, userAnswered, score, feedback, progress, start, respond } =
    useGame(settings, audio, onComplete);
  const [confirming, setConfirming] = useState(false);

  const activeCount = getActiveTypes(settings.matchTypes).length;
  const timings = getTimings(activeCount, settings.responseWindowOffsetMs);

  useEffect(() => {
    start();
  }, []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (phase !== 'stimulus') return;
    const kb = settings.keyBindings;
    const key = e.key.toLowerCase();
    const map: [string, MatchType][] = [
      [kb.position, 'position'],
      [kb.shape, 'shape'],
      [kb.color, 'color'],
      [kb.sound, 'sound'],
    ];
    for (const [k, t] of map) {
      if (key === k.toLowerCase() && settings.matchTypes[t]) {
        respond(t);
        break;
      }
    }
  }, [phase, settings, respond]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const stimulusBarWidth = phase === 'stimulus' ? (1 - progress) * 100 : 0;
  const blankBarWidth = phase === 'blank' ? (1 - progress) * 100 : 0;

  return (
    <div className="game-screen">
      <div className="game-header">
        <span className="game-trial">
          {trialIndex + 1} / {settings.trialCount} 問
        </span>
        <span className="game-nlevel">{settings.nLevel}-back</span>
        <span className="game-score">スコア: {score}</span>
        {confirming ? (
          <span className="quit-confirm">
            やめますか？
            <button className="quit-yes" onClick={onQuit}>はい</button>
            <button className="quit-no" onClick={() => setConfirming(false)}>いいえ</button>
          </span>
        ) : (
          <button className="quit-btn" onClick={() => setConfirming(true)}>中断</button>
        )}
      </div>

      <div className="board-area">
        <Board size={settings.boardSize} activeStimulus={currentStimulus} />
      </div>

      {settings.showTimerBar && (
        <div className="timer-container">
          <div
            className={`timer-bar ${phase === 'stimulus' ? 'timer-bar--stimulus' : 'timer-bar--blank'}`}
            style={{ width: `${phase === 'stimulus' ? stimulusBarWidth : blankBarWidth}%` }}
          />
          <div className="timer-labels">
            <span>{phase === 'stimulus' ? `回答受付中 ${timings.stimulusDuration}ms` : `次の問題まで ${timings.blankDuration}ms`}</span>
          </div>
        </div>
      )}

      <AnswerButtons
        matchTypes={settings.matchTypes}
        userAnswered={userAnswered}
        feedback={feedback}
        keyBindings={settings.keyBindings}
        onRespond={respond}
        disabled={phase !== 'stimulus'}
      />
    </div>
  );
}
