export const MATCH_DURATION = 28000
export const MATCH_CHAPTERS = [0,6000,16000,23000,28000]
export function matchTourFrame(time) {
  const t = Math.max(0,Math.min(MATCH_DURATION,time))
  const active = t < 6000 ? 0 : t < 16000 ? 1 : t < 23000 ? 2 : 3
  const progress = Math.max(0,Math.min(1,(t - MATCH_CHAPTERS[active]) / (MATCH_CHAPTERS[active + 1] - MATCH_CHAPTERS[active])))
  return { active, progress }
}
