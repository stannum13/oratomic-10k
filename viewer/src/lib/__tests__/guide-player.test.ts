import { describe, expect, it } from "vitest";
import { GUIDE_CHAPTERS } from "../guided-experience";
import { createGuidePlayerState, getCurrentBeat, reduceGuidePlayer } from "../guide-player";

describe("guided experiment player", () => {
  it("starts autoplay unless reduced motion is requested", () => {
    expect(reduceGuidePlayer(createGuidePlayerState(), { type: "START", reducedMotion: false }).status).toBe("playing");
    expect(reduceGuidePlayer(createGuidePlayerState(), { type: "START", reducedMotion: true }).status).toBe("paused");
  });

  it("pauses when the visitor changes the experiment", () => {
    const playing = { ...createGuidePlayerState(), status: "playing" as const };
    expect(reduceGuidePlayer(playing, { type: "MANUAL_EDIT" })).toMatchObject({ status: "paused", modified: true });
  });

  it("stops autoplay at a decision beat", () => {
    let state = createGuidePlayerState("allocate");
    state = { ...state, status: "playing", beatIndex: GUIDE_CHAPTERS[1].beats.length - 2 };
    const next = reduceGuidePlayer(state, { type: "TICK" });
    expect(getCurrentBeat(next).awaitAction).toBe(true);
    expect(next.status).toBe("awaiting-action");
  });

  it("keeps navigation inside the six chapters", () => {
    const first = reduceGuidePlayer(createGuidePlayerState(), { type: "PREVIOUS" });
    expect(first.chapterIndex).toBe(0);

    const last = { ...createGuidePlayerState("compare"), beatIndex: GUIDE_CHAPTERS.at(-1)!.beats.length - 1 };
    expect(reduceGuidePlayer(last, { type: "NEXT" }).status).toBe("complete");
  });

  it("restarts at the opening chapter and clears modifications", () => {
    const changed = { ...createGuidePlayerState("noise"), modified: true, status: "paused" as const };
    expect(reduceGuidePlayer(changed, { type: "RESTART" })).toEqual(createGuidePlayerState());
  });
});
