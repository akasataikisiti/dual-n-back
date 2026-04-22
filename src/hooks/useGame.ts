import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import { GameSettings, Stimulus, MatchConfig, TrialRecord, FeedbackMap, MatchType, SessionResult } from '../types';
import { generateStimuli, checkMatches, getActiveTypes, emptyMatch } from '../utils/gameLogic';
import { getTimings } from '../utils/timing';

type Phase = 'stimulus' | 'blank' | 'done';

interface GameState {
  phase: Phase;
  trialIndex: number;
  stimuli: Stimulus[];
  userAnswered: MatchConfig;
  results: TrialRecord[];
  score: number;
  feedback: FeedbackMap | null;
}

type Action =
  | { type: 'START'; stimuli: Stimulus[] }
  | { type: 'TO_BLANK'; record: TrialRecord; scoreGain: number; feedback: FeedbackMap }
  | { type: 'TO_STIMULUS' }
  | { type: 'RESPOND'; matchType: MatchType }
  | { type: 'DONE' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':
      return {
        phase: 'stimulus',
        trialIndex: 0,
        stimuli: action.stimuli,
        userAnswered: emptyMatch(),
        results: [],
        score: 0,
        feedback: null,
      };
    case 'RESPOND':
      if (state.phase !== 'stimulus') return state;
      return { ...state, userAnswered: { ...state.userAnswered, [action.matchType]: true } };
    case 'TO_BLANK':
      return {
        ...state,
        phase: 'blank',
        feedback: action.feedback,
        score: state.score + action.scoreGain,
        results: [...state.results, action.record],
      };
    case 'TO_STIMULUS':
      return {
        ...state,
        phase: 'stimulus',
        trialIndex: state.trialIndex + 1,
        userAnswered: emptyMatch(),
        feedback: null,
      };
    case 'DONE':
      return { ...state, phase: 'done' };
    default:
      return state;
  }
}

const initialState: GameState = {
  phase: 'stimulus',
  trialIndex: 0,
  stimuli: [],
  userAnswered: emptyMatch(),
  results: [],
  score: 0,
  feedback: null,
};

export function useGame(
  settings: GameSettings,
  audio: { playTileChange: () => void; speakLetter: (l: string) => void },
  onDone: (result: SessionResult) => void
) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [progress, setProgress] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const audioRef = useRef(audio);
  audioRef.current = audio;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const handlePhaseEnd = useRef(() => {
    const s = stateRef.current;
    const cfg = settingsRef.current;

    if (s.phase === 'stimulus') {
      const stimIdx = cfg.nLevel + s.trialIndex;
      const shouldMatch = checkMatches(s.stimuli, stimIdx, cfg.nLevel, cfg.matchTypes);
      const activeTypes = getActiveTypes(cfg.matchTypes);
      const feedback: FeedbackMap = {};
      let hits = 0;

      activeTypes.forEach((t) => {
        const should = shouldMatch[t];
        const did = s.userAnswered[t];
        if (should && did) { feedback[t] = 'hit'; hits++; }
        else if (!should && did) { feedback[t] = 'falseAlarm'; }
        else if (should && !did) { feedback[t] = 'miss'; }
        else { feedback[t] = 'correctReject'; }
      });

      const scoreGain = hits * 10 * cfg.nLevel * activeTypes.length;
      const record: TrialRecord = {
        trialIndex: s.trialIndex,
        stimulus: s.stimuli[stimIdx],
        shouldMatch,
        userAnswered: s.userAnswered,
        feedback,
        scoreGain,
      };
      dispatch({ type: 'TO_BLANK', record, scoreGain, feedback });

    } else if (s.phase === 'blank') {
      const nextTrial = s.trialIndex + 1;
      if (nextTrial >= cfg.trialCount) {
        dispatch({ type: 'DONE' });
      } else {
        dispatch({ type: 'TO_STIMULUS' });
        const nextStimIdx = cfg.nLevel + nextTrial;
        audioRef.current.playTileChange();
        if (cfg.matchTypes.sound) {
          audioRef.current.speakLetter(s.stimuli[nextStimIdx].sound);
        }
      }
    }
  });

  useEffect(() => {
    if (state.phase === 'done') {
      const cfg = settingsRef.current;
      const result: SessionResult = {
        id: crypto.randomUUID(),
        date: Date.now(),
        nLevel: cfg.nLevel,
        boardSize: cfg.boardSize,
        activeMatchTypes: getActiveTypes(cfg.matchTypes),
        trialCount: cfg.trialCount,
        score: state.score,
        records: state.results,
      };
      onDoneRef.current(result);
      return;
    }
    if (state.stimuli.length === 0) return;

    const timings = getTimings(getActiveTypes(settingsRef.current.matchTypes).length);
    const duration = state.phase === 'stimulus' ? timings.stimulusDuration : timings.blankDuration;
    const start = performance.now();
    let rafId: number;
    let ended = false;

    const tick = (now: number) => {
      if (ended) return;
      const elapsed = now - start;
      setProgress(Math.min(1, elapsed / duration));
      if (elapsed >= duration) {
        ended = true;
        handlePhaseEnd.current();
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      ended = true;
      cancelAnimationFrame(rafId);
    };
  }, [state.phase, state.trialIndex, state.stimuli.length]);

  const start = useCallback(() => {
    const stimuli = generateStimuli(settings);
    dispatch({ type: 'START', stimuli });
    audioRef.current.playTileChange();
    if (settings.matchTypes.sound) {
      audioRef.current.speakLetter(stimuli[settings.nLevel].sound);
    }
  }, [settings]);

  const respond = useCallback((matchType: MatchType) => {
    dispatch({ type: 'RESPOND', matchType });
  }, []);

  const currentStimulus =
    state.stimuli.length > 0 && state.phase !== 'done'
      ? state.stimuli[settings.nLevel + state.trialIndex]
      : null;

  return {
    phase: state.phase,
    trialIndex: state.trialIndex,
    currentStimulus: state.phase === 'stimulus' ? currentStimulus : null,
    userAnswered: state.userAnswered,
    results: state.results,
    score: state.score,
    feedback: state.feedback,
    progress,
    start,
    respond,
  };
}

