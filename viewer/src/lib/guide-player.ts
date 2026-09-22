import { GUIDE_CHAPTERS, type GuideBeat } from "./guided-experience";
import type { GuideChapterId } from "./url-state";

export type GuidePlayerStatus = "intro" | "playing" | "paused" | "awaiting-action" | "complete";

export interface GuidePlayerState {
  status: GuidePlayerStatus;
  chapterIndex: number;
  beatIndex: number;
  modified: boolean;
}

export type GuidePlayerEvent =
  | { type: "START"; reducedMotion: boolean }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TICK" }
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "GO_TO_CHAPTER"; chapter: GuideChapterId }
  | { type: "MANUAL_EDIT" }
  | { type: "RESTORE_BASELINE" }
  | { type: "COMPLETE_ACTION" }
  | { type: "RESTART" };

export function createGuidePlayerState(initialChapter: GuideChapterId = "frame"): GuidePlayerState {
  const chapterIndex = Math.max(0, GUIDE_CHAPTERS.findIndex((chapter) => chapter.id === initialChapter));
  return { status: "intro", chapterIndex, beatIndex: 0, modified: false };
}

export function getCurrentBeat(state: GuidePlayerState): GuideBeat {
  return GUIDE_CHAPTERS[state.chapterIndex].beats[state.beatIndex];
}

function advance(state: GuidePlayerState, fromAutoplay: boolean): GuidePlayerState {
  const chapter = GUIDE_CHAPTERS[state.chapterIndex];
  if (state.beatIndex < chapter.beats.length - 1) {
    const next = { ...state, beatIndex: state.beatIndex + 1 };
    const beat = getCurrentBeat(next);
    return { ...next, status: beat.awaitAction ? "awaiting-action" : fromAutoplay ? "playing" : "paused" };
  }
  if (state.chapterIndex < GUIDE_CHAPTERS.length - 1) {
    const next = { ...state, chapterIndex: state.chapterIndex + 1, beatIndex: 0 };
    return { ...next, status: fromAutoplay ? "playing" : "paused" };
  }
  return { ...state, status: "complete" };
}

export function reduceGuidePlayer(state: GuidePlayerState, event: GuidePlayerEvent): GuidePlayerState {
  switch (event.type) {
    case "START":
      return { ...state, status: getCurrentBeat(state).awaitAction ? "awaiting-action" : event.reducedMotion ? "paused" : "playing" };
    case "PLAY":
      return state.status === "complete" ? state : { ...state, status: getCurrentBeat(state).awaitAction ? "awaiting-action" : "playing" };
    case "PAUSE":
      return state.status === "complete" ? state : { ...state, status: "paused" };
    case "TICK":
      return state.status === "playing" ? advance(state, true) : state;
    case "NEXT":
      return advance(state, false);
    case "COMPLETE_ACTION":
      return advance({ ...state, modified: state.modified }, true);
    case "PREVIOUS": {
      if (state.beatIndex > 0) return { ...state, beatIndex: state.beatIndex - 1, status: "paused" };
      if (state.chapterIndex === 0) return { ...state, status: "paused" };
      const chapterIndex = state.chapterIndex - 1;
      return { ...state, chapterIndex, beatIndex: GUIDE_CHAPTERS[chapterIndex].beats.length - 1, status: "paused" };
    }
    case "GO_TO_CHAPTER": {
      const chapterIndex = GUIDE_CHAPTERS.findIndex((chapter) => chapter.id === event.chapter);
      if (chapterIndex < 0) return state;
      const status = GUIDE_CHAPTERS[chapterIndex].beats[0].awaitAction ? "awaiting-action" : "paused";
      return { ...state, chapterIndex, beatIndex: 0, status };
    }
    case "MANUAL_EDIT":
      return { ...state, status: "paused", modified: true };
    case "RESTORE_BASELINE":
      return { ...state, status: "paused", modified: false };
    case "RESTART":
      return createGuidePlayerState();
  }
}
