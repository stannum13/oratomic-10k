"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { GUIDE_CHAPTERS } from "@/lib/guided-experience";
import { createGuidePlayerState, getCurrentBeat, reduceGuidePlayer } from "@/lib/guide-player";
import type { GuideChapterId } from "@/lib/url-state";
import { useSimulator } from "@/store/simulator";

const STORAGE_KEY = "oratomic-guide-progress-v1";

export function useGuidePlayer({
  initialChapter,
  reducedMotion,
  onChapterChange,
}: {
  initialChapter?: GuideChapterId;
  reducedMotion: boolean;
  onChapterChange?: (chapter: GuideChapterId) => void;
}) {
  const [state, dispatch] = useReducer(reduceGuidePlayer, initialChapter ?? "frame", createGuidePlayerState);
  const [snapshot] = useState(() => {
    const simulator = useSimulator.getState();
    return {
      hardwarePlatform: simulator.hardwarePlatform,
      physicalErrorRate: simulator.physicalErrorRate,
      cycleTime: simulator.cycleTime,
      architectureType: simulator.architectureType,
      targetProblem: simulator.targetProblem,
      memoryCode: simulator.memoryCode,
      processorCode: simulator.processorCode,
      decoderType: simulator.decoderType,
      noiseModel: simulator.noiseModel,
    };
  });
  const chapter = GUIDE_CHAPTERS[state.chapterIndex];
  const beat = getCurrentBeat(state);

  useEffect(() => {
    if (initialChapter || typeof window === "undefined") return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as { chapterId?: GuideChapterId } | null;
      if (saved?.chapterId && GUIDE_CHAPTERS.some((item) => item.id === saved.chapterId)) {
        dispatch({ type: "GO_TO_CHAPTER", chapter: saved.chapterId });
      }
    } catch { /* progress persistence is optional */ }
  }, [initialChapter]);

  useEffect(() => {
    onChapterChange?.(chapter.id);
    if (state.status === "intro") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ chapterId: chapter.id, beatId: beat.id }));
    } catch { /* progress persistence is optional */ }
  }, [beat.id, chapter.id, onChapterChange, state.status]);

  useEffect(() => {
    if (state.status !== "playing" || beat.durationMs <= 0) return;
    const timer = window.setTimeout(() => dispatch({ type: "TICK" }), beat.durationMs);
    return () => window.clearTimeout(timer);
  }, [beat.durationMs, beat.id, state.status]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) dispatch({ type: "PAUSE" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const restoreBaseline = useCallback(() => {
    const simulator = useSimulator.getState();
    simulator.setHardwarePlatform(snapshot.hardwarePlatform);
    simulator.setPhysicalErrorRate(snapshot.physicalErrorRate);
    simulator.setCycleTime(snapshot.cycleTime);
    simulator.setArchitectureType(snapshot.architectureType);
    simulator.setTargetProblem(snapshot.targetProblem);
    simulator.setMemoryCode(snapshot.memoryCode);
    simulator.setProcessorCode(snapshot.processorCode);
    simulator.setDecoderType(snapshot.decoderType);
    simulator.setNoiseModel(snapshot.noiseModel);
    dispatch({ type: "RESTORE_BASELINE" });
  }, [snapshot]);

  return {
    state,
    chapter,
    beat,
    dispatch,
    start: () => dispatch({ type: "START", reducedMotion }),
    markModified: () => dispatch({ type: "MANUAL_EDIT" }),
    restoreBaseline,
  };
}
