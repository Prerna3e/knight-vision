const K_FACTOR = 32

/**
 * Expected score for player A against player B
 * Returns a number between 0 and 1
 * e.g. 0.75 means player A is expected to win 75% of the time
 */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

/**
 * Calculate new Elo rating
 * actual: 1 = win, 0.5 = draw, 0 = loss
 */
export function newRating(
  currentRating: number,
  opponentRating: number,
  actual: 1 | 0.5 | 0
): number {
  const expected = expectedScore(currentRating, opponentRating)
  return Math.round(currentRating + K_FACTOR * (actual - expected))
}

/**
 * Calculate new ratings for both players after a game
 */
export function calculateEloChange(
  whiteRating: number,
  blackRating: number,
  result: 'WHITE_WIN' | 'BLACK_WIN' | 'DRAW'
) {
  const whiteActual = result === 'WHITE_WIN' ? 1 : result === 'DRAW' ? 0.5 : 0
  const blackActual = result === 'BLACK_WIN' ? 1 : result === 'DRAW' ? 0.5 : 0

  return {
    newWhiteRating: newRating(whiteRating, blackRating, whiteActual as 1 | 0.5 | 0),
    newBlackRating: newRating(blackRating, whiteRating, blackActual as 1 | 0.5 | 0),
  }
}
