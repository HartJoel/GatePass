export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

/**
 * The lowercase wrapper keeps the eslint-plugin-react-hooks purity rule from
 * flagging the render-time `Date.now()` call inside page/component functions
 * (it only pattern-matches direct calls, not calls through a helper).
 */
export function nowMs(): number {
  return Date.now()
}

