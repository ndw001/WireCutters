import React from 'react'
import { getTotalPlayed, TOTAL_CARDS } from '../game/logic'

export default function GameOver({ state, onRestart }) {
  const { phase, playedCount, lives } = state
  const isWin = phase === 'win'
  const totalPlayed = getTotalPlayed(playedCount)

  return (
    <div className={`screen gameover-screen ${isWin ? 'win' : 'lose'}`}>
      <div className="gameover-content">
        <div className="gameover-icon">{isWin ? '🎉' : '💥'}</div>
        <h1 className="gameover-title">
          {isWin ? 'BOMB DEFUSED!' : 'BOOM!'}
        </h1>
        <p className="gameover-sub">
          {isWin
            ? 'Outstanding work, agents. The city is safe.'
            : 'The bomb detonated. Better luck next mission.'}
        </p>

        <div className="gameover-stats">
          <div className="stat">
            <span className="stat-label">Cards Defused</span>
            <span className="stat-value">{totalPlayed} / {TOTAL_CARDS}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Lives Remaining</span>
            <span className="stat-value">{lives} / 3</span>
          </div>
          <div className="stat">
            <span className="stat-label">Completion</span>
            <span className="stat-value">{Math.round((totalPlayed / TOTAL_CARDS) * 100)}%</span>
          </div>
        </div>

        <button className="btn-primary btn-large" onClick={onRestart}>
          NEW MISSION
        </button>
      </div>
    </div>
  )
}
