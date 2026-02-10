// Bomb Busters – Basic (no yellow, no red)
// Deck: 4 copies of numbers 1-12 = 48 cards

export const TOTAL_CARDS = 48
export const MAX_LIVES = 3
export const CARD_MIN = 1
export const CARD_MAX = 12
export const COPIES_PER_NUMBER = 4
export const HINT_COPIES = 2 // 2 of each hint token number

export function createDeck() {
  const deck = []
  for (let n = CARD_MIN; n <= CARD_MAX; n++) {
    for (let c = 0; c < COPIES_PER_NUMBER; c++) {
      deck.push(n)
    }
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

export function dealCards(playerCount) {
  const deck = shuffle(createDeck())
  const hands = Array.from({ length: playerCount }, () => [])
  deck.forEach((card, i) => hands[i % playerCount].push(card))
  return hands.map(hand => [...hand].sort((a, b) => a - b))
}

export function createHintPool() {
  const pool = {}
  for (let n = CARD_MIN; n <= CARD_MAX; n++) {
    pool[n] = HINT_COPIES
  }
  return pool
}

export function createPlayedCount() {
  const counts = {}
  for (let n = CARD_MIN; n <= CARD_MAX; n++) {
    counts[n] = 0
  }
  return counts
}

// Returns the next card number needed, or null if all played
export function getNextNeeded(playedCount) {
  for (let n = CARD_MIN; n <= CARD_MAX; n++) {
    if (playedCount[n] < COPIES_PER_NUMBER) return n
  }
  return null
}

// Returns total cards played so far
export function getTotalPlayed(playedCount) {
  return Object.values(playedCount).reduce((sum, v) => sum + v, 0)
}

// Initial state factory
export function createInitialState() {
  return {
    phase: 'setup', // setup | hint | play | win | lose
    playerCount: 2,
    players: [],
    hintPool: {},
    playedCount: {},
    lives: MAX_LIVES,
    currentPlayerIndex: 0,
    handRevealed: false,
    lastAction: null, // { result: 'success'|'fail', card: number }
  }
}

// Pure reducer
export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const { playerCount } = action
      const hands = dealCards(playerCount)
      const players = Array.from({ length: playerCount }, (_, i) => ({
        id: i,
        name: `Player ${i + 1}`,
        hand: hands[i],
        hintToken: null,
      }))
      return {
        phase: 'hint',
        playerCount,
        players,
        hintPool: createHintPool(),
        playedCount: createPlayedCount(),
        lives: MAX_LIVES,
        currentPlayerIndex: 0,
        handRevealed: false,
        lastAction: null,
      }
    }

    case 'ASSIGN_HINT': {
      const { hintNumber } = action
      if (state.hintPool[hintNumber] <= 0) return state // guard
      const newPool = { ...state.hintPool, [hintNumber]: state.hintPool[hintNumber] - 1 }
      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, hintToken: hintNumber } : p
      )
      const nextIndex = state.currentPlayerIndex + 1
      if (nextIndex >= state.playerCount) {
        return { ...state, hintPool: newPool, players: newPlayers, phase: 'play', currentPlayerIndex: 0 }
      }
      return { ...state, hintPool: newPool, players: newPlayers, currentPlayerIndex: nextIndex }
    }

    case 'PASS_HINT': {
      const nextIndex = state.currentPlayerIndex + 1
      if (nextIndex >= state.playerCount) {
        return { ...state, phase: 'play', currentPlayerIndex: 0 }
      }
      return { ...state, currentPlayerIndex: nextIndex }
    }

    case 'REVEAL_HAND': {
      return { ...state, handRevealed: true }
    }

    case 'PLAY_CARD': {
      const { card } = action
      const player = state.players[state.currentPlayerIndex]
      const nextNeeded = getNextNeeded(state.playedCount)
      const isCorrect = card === nextNeeded

      // Remove exactly one copy of the card from the player's hand
      const newHand = [...player.hand]
      const idx = newHand.indexOf(card)
      newHand.splice(idx, 1)

      const newPlayers = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, hand: newHand } : p
      )

      const newPlayedCount = isCorrect
        ? { ...state.playedCount, [card]: state.playedCount[card] + 1 }
        : state.playedCount

      const newLives = isCorrect ? state.lives : state.lives - 1
      const totalPlayed = getTotalPlayed(newPlayedCount)

      let newPhase = 'play'
      if (totalPlayed === TOTAL_CARDS) newPhase = 'win'
      else if (newLives === 0) newPhase = 'lose'

      return {
        ...state,
        players: newPlayers,
        playedCount: newPlayedCount,
        lives: newLives,
        phase: newPhase,
        handRevealed: false,
        lastAction: { result: isCorrect ? 'success' : 'fail', card, needed: nextNeeded },
      }
    }

    case 'NEXT_TURN': {
      // Skip players with empty hands (shouldn't happen with equal dealing, but just in case)
      let nextIndex = (state.currentPlayerIndex + 1) % state.playerCount
      let checked = 0
      while (state.players[nextIndex].hand.length === 0 && checked < state.playerCount) {
        nextIndex = (nextIndex + 1) % state.playerCount
        checked++
      }
      return { ...state, currentPlayerIndex: nextIndex, lastAction: null, handRevealed: false }
    }

    case 'RESTART': {
      return createInitialState()
    }

    default:
      return state
  }
}
