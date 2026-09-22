"use client";

import type { Dispatch } from "react";
import type { GuidePlayerEvent, GuidePlayerState } from "@/lib/guide-player";
import { GUIDE_CHAPTERS } from "@/lib/guided-experience";

export function PlayerControls({ state, dispatch }: { state: GuidePlayerState; dispatch: Dispatch<GuidePlayerEvent> }) {
  const playing = state.status === "playing";
  const atStart = state.chapterIndex === 0 && state.beatIndex === 0;
  return (
    <div className="guided-player" aria-label="Guided experiment controls">
      <button type="button" onClick={() => dispatch({ type: "PREVIOUS" })} disabled={atStart} aria-label="Previous guided step">← <span>Back</span></button>
      <button
        type="button"
        className="guided-player__play"
        aria-label={playing ? "Pause guided experiment" : "Play guided experiment"}
        onClick={() => dispatch({ type: playing ? "PAUSE" : "PLAY" })}
        disabled={state.status === "awaiting-action" || state.status === "complete"}
      >
        {playing ? "Ⅱ" : "▶"} <span>{playing ? "Pause" : "Play"}</span>
      </button>
      <span className="guided-player__position">Chapter {state.chapterIndex + 1} of {GUIDE_CHAPTERS.length}</span>
      <button type="button" onClick={() => dispatch({ type: "NEXT" })} aria-label="Next guided step" disabled={state.status === "awaiting-action"}><span>Next</span> →</button>
    </div>
  );
}
