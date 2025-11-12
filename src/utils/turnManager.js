/**
 * Turn manager - manages turn order and current acting character
 * Turn system: P1+E1 is one turn, P2+E2 is one turn, etc.
 */

// Turn pairs (each turn contains one player and one enemy)
const TURN_PAIRS = [
  { player: 'player-1', enemy: 'enemy-1' },
  { player: 'player-2', enemy: 'enemy-2' },
  { player: 'player-3', enemy: 'enemy-3' },
  { player: 'player-4', enemy: 'enemy-4' }
]

/**
 * Get current turn pair
 * @param {number} turn - Current turn number (starts from 1)
 * @returns {Object} Object containing player and enemy
 */
export function getCurrentTurnPair(turn) {
  const index = (turn - 1) % TURN_PAIRS.length
  return TURN_PAIRS[index]
}

/**
 * Get current turn character ID
 * @param {number} turn - Current turn number
 * @param {boolean} isPlayerPhase - Is player phase
 * @returns {string} Character ID
 */
export function getCurrentTurnCharacter(turn, isPlayerPhase = true) {
  const pair = getCurrentTurnPair(turn)
  return isPlayerPhase ? pair.player : pair.enemy
}

/**
 * Check if character is current turn actor
 * @param {string} characterId - Character ID
 * @param {number} turn - Current turn number
 * @param {boolean} isPlayerPhase - Is player phase
 * @returns {boolean}
 */
export function isCurrentTurn(characterId, turn, isPlayerPhase = true) {
  return getCurrentTurnCharacter(turn, isPlayerPhase) === characterId
}

/**
 * Get next turn number
 * @param {number} currentTurn - Current turn number
 * @returns {number} Next turn number
 */
export function getNextTurn(currentTurn) {
  return currentTurn + 1
}

/**
 * Get enemy ID for player ID
 * @param {string} playerId - Player ID
 * @returns {string} Enemy ID
 */
export function getEnemyForPlayer(playerId) {
  const pair = TURN_PAIRS.find(p => p.player === playerId)
  return pair ? pair.enemy : null
}

