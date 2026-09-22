"use client";

import type { Dispatch } from "react";
import { GUIDE_CHAPTERS } from "@/lib/guided-experience";
import type { GuidePlayerEvent, GuidePlayerState } from "@/lib/guide-player";

export function ChapterTimeline({ state, dispatch }: { state: GuidePlayerState; dispatch: Dispatch<GuidePlayerEvent> }) {
  return (
    <nav className="chapter-timeline" aria-label="Guided experiment chapters">
      {GUIDE_CHAPTERS.map((chapter, index) => (
        <button key={chapter.id} type="button" aria-current={state.chapterIndex === index ? "step" : undefined} data-complete={index < state.chapterIndex} onClick={() => dispatch({ type: "GO_TO_CHAPTER", chapter: chapter.id })}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{chapter.shortTitle}</strong>
        </button>
      ))}
    </nav>
  );
}
