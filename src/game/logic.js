// Bomb Busters – Basic Edition (blue tiles only, no yellow, no red)
// 4 copies of numbers 1-12 = 48 tiles total
// Core mechanic: Dual Cut (pick your tile, tap another player's face-down tile)
//   Match  → both tiles removed
//   Miss   → their tile gets an info token revealing its number; bomb countdown advances
// Solo Cut: if you hold ALL remaining copies of a number, cut them yourself

export const TOTAL_TILES = 48
export const MAX_LIVES = 3
export const CARD_MIN = 1
export const CARD_MAX = 12
export const COPIES = 4
export const HINT_COPIES = 2 // 2 of each info token available in setup

export function createDeck() {
  const deck = []
  for (let n = CARD_MIN; n <= CARD_MAX; n++) {
    for (let c = 0; c < COPIES; c++) deck.push(n)
  }
  return deck
}

export function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function dealTiles(playerCount) {
  const deck = shuffle(createDeck())
  const hands = Array.from({ length: playerCount }, () => [])
  deck.forEach((val, i) => hands[i % playerCount].push(val))
  // Sort ascending, wrap each card as { value, hintToken }
  return hands.map(hand =>
    [...hand].sort((a, b) => a - b).map(value => ({ value, hintToken: null }))
  )
}

export function createHintPool() {
  const pool = {}
  for (let n = CARD_MIN; n <= CARD_MAX; n++) pool[n] = HINT_COPIES
  return pool
}

export function totalTilesLeft(players) {
  return players.reduce((sum, p) => sum + p.tiles.length, 0)
}

// Returns the values the current player can Solo Cut
// (they hold ALL remaining uncut copies of that number)
export function getSoloCutOptions(players, currentPlayerIndex) {
  const totalCounts = {}
  const myCounts = {}
  players.forEach((p, i) => {
    p.tiles.forEach(t => {
      totalCounts[t.value] = (totalCounts[t.value] || 0) + 1
      if (i === currentPlayerIndex) myCounts[t.value] = (myCounts[t.value] || 0) + 1
    })
  })
  return Object.keys(myCounts)
    .map(Number)
    .filter(v => myCounts[v] === totalCounts[v])
    .sort((a, b) => a - b)
}

export function createInitialState() {
  return {
    phase: 'setup',       // setup | pass | hint | play | win | lose
    playerCount: 2,
    players: [],
    hintPool: {},
    lives: MAX_LIVES,
    currentPlayerIndex: 0,
    selectedTile: null,   // index into current player's tiles array
    lastAction: null,     // { type, myValue?, targetValue?, value?, count?, nextPlayerIndex }
    passTo: null,         // player index shown on pass screen
    passNextPhase: null,  // phase to resume after pass confirmed
  }
}

export function gameReducer(state, action) {
  switch (action.type) {

    case 'START_GAME': {
      const { playerCount } = action
      const tileHands = dealTiles(playerCount)
      const players = Array.from({ length: playerCount }, (_, i) => ({
        id: i,
        name: `Player ${i + 1}`,
        tiles: tileHands[i],
      }))
      return {
        ...createInitialState(),
        phase: 'pass',
        playerCount,
        players,
        hintPool: createHintPool(),
        lives: MAX_LIVES,
        currentPlayerIndex: 0,
        passTo: 0,
        passNextPhase: 'hint',
      }
    }

    case 'CONFIRM_PASS': {
      return {
        ...state,
        phase: state.passNextPhase,
        passTo: null,
        passNextPhase: null,
        lastAction: null,
        selectedTile: null,
      }
    }

    // Hint phase: player taps one of their own tiles to place an info token on it
    case 'ASSIGN_HINT': {
      const { tileIndex } = action
      const currentPlayer = state.players[state.currentPlayerIndex]
      const tile = currentPlayer.tiles[tileIndex]
      if (tile.hintToken !== null) return state           // already hinted
      if (state.hintPool[tile.value] <= 0) return state  // pool exhausted for this number

      const newTiles = currentPlayer.tiles.map((t, i) =>
        i === tileIndex ? { ...t, hintToken: t.value } : t
      )
      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, tiles: newTiles } : p
      )
      const newPool = { ...state.hintPool, [tile.value]: state.hintPool[tile.value] - 1 }
      return advanceHintPhase({ ...state, players: newPlayers, hintPool: newPool })
    }

    case 'PASS_HINT': {
      return advanceHintPhase(state)
    }

    // Play phase: tap your own tile to select it (tap again to deselect)
    case 'SELECT_TILE': {
      const { tileIndex } = action
      return {
        ...state,
        selectedTile: state.selectedTile === tileIndex ? null : tileIndex,
      }
    }

    // Play phase: after selecting your tile, tap a face-down tile from another player
    case 'MATCH_TILES': {
      const { targetPlayerId, targetTileIndex } = action
      if (state.selectedTile === null) return state

      const currentPlayer = state.players[state.currentPlayerIndex]
      const targetPlayer = state.players[targetPlayerId]
      const myTile = currentPlayer.tiles[state.selectedTile]
      const targetTile = targetPlayer.tiles[targetTileIndex]
      const isMatch = myTile.value === targetTile.value

      let newPlayers
      let newLives = state.lives

      if (isMatch) {
        // Both tiles removed
        const myIdx = state.selectedTile
        const newMyTiles = currentPlayer.tiles.filter((_, i) => i !== myIdx)
        const newTargetTiles = targetPlayer.tiles.filter((_, i) => i !== targetTileIndex)
        newPlayers = state.players.map((p, i) => {
          if (i === state.currentPlayerIndex) return { ...p, tiles: newMyTiles }
          if (i === targetPlayerId)           return { ...p, tiles: newTargetTiles }
          return p
        })
      } else {
        // Info token placed on target tile; countdown advances (lose a life)
        const newTargetTiles = targetPlayer.tiles.map((t, i) =>
          i === targetTileIndex ? { ...t, hintToken: t.value } : t
        )
        newPlayers = state.players.map((p, i) =>
          i === targetPlayerId ? { ...p, tiles: newTargetTiles } : p
        )
        newLives--
      }

      const remaining = totalTilesLeft(newPlayers)
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount

      let newPhase = 'play'
      if (remaining === 0) newPhase = 'win'
      else if (newLives === 0) newPhase = 'lose'

      return {
        ...state,
        players: newPlayers,
        lives: newLives,
        phase: newPhase,
        selectedTile: null,
        lastAction: {
          type: isMatch ? 'dual-match' : 'dual-miss',
          myValue: myTile.value,
          targetValue: targetTile.value,
          targetPlayerName: targetPlayer.name,
          nextPlayerIndex: newPhase === 'play' ? nextPlayerIndex : null,
        },
      }
    }

    // Play phase: cut all your remaining copies of a value (you hold every copy left)
    case 'SOLO_CUT': {
      const { value } = action
      const soloCutOptions = getSoloCutOptions(state.players, state.currentPlayerIndex)
      if (!soloCutOptions.includes(value)) return state

      const currentPlayer = state.players[state.currentPlayerIndex]
      const removedCount = currentPlayer.tiles.filter(t => t.value === value).length
      const newTiles = currentPlayer.tiles.filter(t => t.value !== value)
      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, tiles: newTiles } : p
      )

      const remaining = totalTilesLeft(newPlayers)
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount

      const newPhase = remaining === 0 ? 'win' : 'play'

      return {
        ...state,
        players: newPlayers,
        phase: newPhase,
        selectedTile: null,
        lastAction: {
          type: 'solo',
          value,
          count: removedCount,
          nextPlayerIndex: newPhase === 'play' ? nextPlayerIndex : null,
        },
      }
    }

    // Dismiss result overlay → show pass screen for next player
    case 'NEXT_TURN': {
      const nextPlayerIndex = state.lastAction?.nextPlayerIndex
      if (nextPlayerIndex == null) return state
      return {
        ...state,
        phase: 'pass',
        currentPlayerIndex: nextPlayerIndex,
        passTo: nextPlayerIndex,
        passNextPhase: 'play',
        lastAction: null,
        selectedTile: null,
      }
    }

    case 'RESTART':
      return createInitialState()

    default:
      return state
  }
}

function advanceHintPhase(state) {
  const nextIndex = state.currentPlayerIndex + 1
  if (nextIndex >= state.playerCount) {
    // All players hinted → start play phase from Player 1
    return {
      ...state,
      phase: 'pass',
      currentPlayerIndex: 0,
      passTo: 0,
      passNextPhase: 'play',
    }
  }
  // Pass to next player's hint turn
  return {
    ...state,
    phase: 'pass',
    currentPlayerIndex: nextIndex,
    passTo: nextIndex,
    passNextPhase: 'hint',
  }
}
