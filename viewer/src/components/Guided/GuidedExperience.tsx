"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { GuideChapterId } from "@/lib/url-state";
import { useGuidePlayer } from "@/hooks/useGuidePlayer";
import { ChapterTimeline } from "./ChapterTimeline";
import { GuidedStage } from "./GuidedStage";
import { PlayerControls } from "./PlayerControls";

export function GuidedExperience({
  qpuView,
  reducedMotion,
  initialChapter,
  onChapterChange,
  onExplore,
}: {
  qpuView: ReactNode;
  reducedMotion: boolean;
  initialChapter?: GuideChapterId;
  onChapterChange?: (chapter: GuideChapterId) => void;
  onExplore: () => void;
}) {
  const player = useGuidePlayer({ initialChapter, reducedMotion, onChapterChange });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dispatch = player.dispatch;
  const playerStatus = player.state.status;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, select, textarea, button, [contenteditable=true]")) return;
      if (event.key === "Escape") dispatch({ type: "PAUSE" });
      if (event.key === " ") {
        event.preventDefault();
        dispatch({ type: playerStatus === "playing" ? "PAUSE" : "PLAY" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, playerStatus]);

  if (player.state.status === "intro") {
    return (
      <main className="guided-intro">
        <div className="guided-intro__copy">
          <span className="guided-eyebrow">Guided fault-tolerance experiment</span>
          <h1>Can this machine do useful work?</h1>
          <p>Run one ECC-256 workload through the physical qubits, noise, sensing, decoding, and feedback that determine whether it finishes.</p>
          <p className="guided-intro__truth"><strong>Architecture explorer and resource estimator</strong> — not a quantum emulator.</p>
          <div className="guided-intro__actions">
            <button type="button" className="guided-primary-action" onClick={player.start}>Start guided experiment</button>
            <button type="button" className="guided-secondary-action" onClick={onExplore}>Explore freely</button>
          </div>
          <small>About 2–3 minutes · No audio · Pause or leave at any time</small>
        </div>
        <div className="guided-intro__map" aria-label="The experiment path">
          <span>01 Workload</span><span>02 Allocation</span><span>03 Noise</span><span>04 Feedback</span><span>05 Feasibility</span><span>06 Compare</span>
        </div>
      </main>
    );
  }

  return (
    <main className="guided-experience">
      <aside className="guided-story" aria-labelledby="guided-story-title">
        <div className="guided-story__topline"><span>{player.chapter.shortTitle}</span><button type="button" onClick={onExplore}>Explore freely</button></div>
        <span className="guided-story__provenance">{player.beat.provenance}</span>
        <p className="guided-story__question">{player.beat.question}</p>
        <h1 id="guided-story-title" ref={headingRef} tabIndex={-1}>{player.beat.title}</h1>
        <p className="guided-story__explanation">{player.beat.explanation}</p>
        <p className="guided-story__caption" aria-live="polite">{player.beat.caption}</p>

        {player.state.modified && player.state.status === "paused" && (
          <div className="experiment-changed" role="status">
            <strong>You changed the experiment</strong>
            <p>Playback paused so the model does not overwrite your input.</p>
            <div><button type="button" onClick={() => player.dispatch({ type: "PLAY" })}>Continue from here</button><button type="button" onClick={player.restoreBaseline}>Restore guided baseline</button></div>
          </div>
        )}
        <ChapterTimeline state={player.state} dispatch={player.dispatch} />
      </aside>

      <GuidedStage beat={player.beat} qpuView={qpuView} markModified={player.markModified} completeAction={() => player.dispatch({ type: "COMPLETE_ACTION" })} />
      <PlayerControls state={player.state} dispatch={player.dispatch} />
    </main>
  );
}
