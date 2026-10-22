export const MATCH_DURATION = 34000
export const MATCH_CHAPTERS = [0,6000,17000,26000,34000]
const clamp = value => Math.max(0,Math.min(1,value))
export function matchTourFrame(time) {
  const t = Math.max(0,Math.min(MATCH_DURATION,time))
  const active = t < 6000 ? 0 : t < 17000 ? 1 : t < 26000 ? 2 : 3
  const progress = clamp((t - MATCH_CHAPTERS[active]) / (MATCH_CHAPTERS[active + 1] - MATCH_CHAPTERS[active]))
  const adjust = clamp((t - 8000) / 6000)
  const volume = Math.round(40 - 22 * clamp((t - 19000) / 3000))
  const points = [[46,33],[54,88],[27,91],[87,36]]
  const from = points[Math.max(0,active - 1)], to = points[active]
  const move = clamp(progress * 5), ease = move * move * (3 - 2 * move)
  return { active, progress, offset:Math.round(69 * (1 - adjust)) / 10,
    volumes:[volume,0,42], muted:[false,true,t >= 23000],
    cursor:[from[0] + (to[0] - from[0]) * ease,from[1] + (to[1] - from[1]) * ease] }
}
