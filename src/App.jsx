import React, { useReducer } from 'react'
import { gameReducer, createInitialState } from './game/logic'
import Setup from './components/Setup'
import HintPhase from './components/HintPhase'
import PlayPhase from './components/PlayPhase'
import GameOver from './components/GameOver'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  function handleStart(playerCount) {
    dispatch({ type: 'START_GAME', playerCount })
  }

  function handleAssignHint(hintNumber) {
    dispatch({ type: 'ASSIGN_HINT', hintNumber })
  }

  function handlePassHint() {
    dispatch({ type: 'PASS_HINT' })
  }

  function handleReveal() {
    dispatch({ type: 'REVEAL_HAND' })
  }

  function handlePlayCard(card) {
    dispatch({ type: 'PLAY_CARD', card })
  }

  function handleNextTurn() {
    dispatch({ type: 'NEXT_TURN' })
  }

  function handleRestart() {
    dispatch({ type: 'RESTART' })
  }

  switch (state.phase) {
    case 'setup':
      return <Setup onStart={handleStart} />

    case 'hint':
      return (
        <HintPhase
          state={state}
          onAssign={handleAssignHint}
          onPass={handlePassHint}
        />
      )

    case 'play':
      return (
        <PlayPhase
          state={state}
          onReveal={handleReveal}
          onPlayCard={handlePlayCard}
          onNextTurn={handleNextTurn}
        />
      )

    case 'win':
    case 'lose':
      return <GameOver state={state} onRestart={handleRestart} />

    default:
      return null
  }
}
