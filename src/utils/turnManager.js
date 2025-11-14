const TURN_ORDER = ['player-1', 'player-2', 'enemy-1', 'enemy-2', 'enemy-3', 'enemy-4']

export function getCurrentTurnCharacter(turn) {
  const index = (turn - 1) % TURN_ORDER.length
  return TURN_ORDER[index]
}

export function isPlayerTurn(turn) {
  const characterId = getCurrentTurnCharacter(turn)
  return characterId.startsWith('player-')
}

export function getCurrentTurnPair(turn) {
  const characterId = getCurrentTurnCharacter(turn)
  if (characterId.startsWith('player-')) {
    const playerIndex = parseInt(characterId.split('-')[1]) - 1
    return {
      player: characterId,
      enemy: `enemy-${playerIndex + 1}`
    }
  } else {
    const enemyIndex = parseInt(characterId.split('-')[1]) - 1
    return {
      player: `player-${enemyIndex + 1}`,
      enemy: characterId
    }
  }
}

export function isCurrentTurn(characterId, turn, isPlayerPhase = null) {
  return getCurrentTurnCharacter(turn) === characterId
}

export function getNextTurn(currentTurn) {
  return currentTurn + 1
}

export function getEnemyForPlayer(playerId) {
  const pair = TURN_PAIRS.find(p => p.player === playerId)
  return pair ? pair.enemy : null
}

