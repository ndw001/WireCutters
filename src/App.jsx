import React, { useReducer } from 'react'
import { gameReducer, createInitialState } from './game/logic'
import Setup from './components/Setup'
import PassScreen from './components/PassScreen'
import HintPhase from './components/HintPhase'
import PlayPhase from './components/PlayPhase'
import GameOver from './components/GameOver'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  switch (state.phase) {
    case 'setup':
      return <Setup onStart={(playerCount) => dispatch({ type: 'START_GAME', playerCount })} />

    case 'pass':
      return <PassScreen state={state} onConfirm={() => dispatch({ type: 'CONFIRM_PASS' })} />

    case 'hint':
      return (
        <HintPhase
          state={state}
          onAssign={(tileIndex) => dispatch({ type: 'ASSIGN_HINT', tileIndex })}
          onPass={() => dispatch({ type: 'PASS_HINT' })}
        />
      )

    case 'play':
      return (
        <PlayPhase
          state={state}
          onSelectTile={(tileIndex) => dispatch({ type: 'SELECT_TILE', tileIndex })}
          onMatchTile={(targetPlayerId, targetTileIndex) =>
            dispatch({ type: 'MATCH_TILES', targetPlayerId, targetTileIndex })
          }
          onSoloCut={(value) => dispatch({ type: 'SOLO_CUT', value })}
          onContinue={() => dispatch({ type: 'NEXT_TURN' })}
        />
      )

    case 'win':
    case 'lose':
      return <GameOver state={state} onRestart={() => dispatch({ type: 'RESTART' })} />

    default:
      return null
  }
}
