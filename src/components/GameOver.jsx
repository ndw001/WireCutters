import React from 'react'
import { TOTAL_TILES, totalTilesLeft } from '../game/logic'

export default function GameOver({ state, onRestart }) {
  const { phase, players, lives } = state
  const isWin = phase === 'win'
  const remaining = totalTilesLeft(players)
  const cut = TOTAL_TILES - remaining

  return (
    <div className={`screen gameover-screen ${isWin ? 'win' : 'lose'}`}>
      <div className="gameover-content">
        <div className="gameover-icon">{isWin ? '🎉' : '💥'}</div>
        <h1 className="gameover-title">{isWin ? 'BOMB DEFUSED!' : 'BOOM!'}</h1>
        <p className="gameover-sub">
          {isWin
            ? 'Outstanding teamwork. The city is safe.'
            : 'The bomb detonated. Better luck next mission.'}
        </p>
        <div className="gameover-stats">
          <div className="stat">
            <span className="stat-label">Wires Cut</span>
            <span className="stat-value">{cut} / {TOTAL_TILES}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Lives Left</span>
            <span className="stat-value">{lives} / 3</span>
          </div>
          <div className="stat">
            <span className="stat-label">Completion</span>
            <span className="stat-value">{Math.round((cut / TOTAL_TILES) * 100)}%</span>
          </div>
        </div>
        <button className="btn-primary btn-large" onClick={onRestart}>
          NEW MISSION
        </button>
      </div>
    </div>
  )
}
