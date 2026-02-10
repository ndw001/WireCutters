import React, { useState } from 'react'

export default function Setup({ onStart }) {
  const [playerCount, setPlayerCount] = useState(2)

  return (
    <div className="screen setup-screen">
      <div className="logo">
        <div className="logo-bomb">💣</div>
        <h1>BOMB BUSTERS</h1>
        <p className="subtitle">Basic Edition</p>
      </div>

      <div className="setup-card">
        <h2>Mission Briefing</h2>
        <p className="brief-text">
          Work together to defuse the bomb. Play cards <strong>1 through 12</strong> in ascending order
          — four of each. Use hint tokens wisely to coordinate. You have <strong>3 lives</strong>.
        </p>

        <div className="setup-rule-list">
          <div className="rule">
            <span className="rule-icon">🃏</span>
            <span>48 cards — four copies of 1–12, dealt equally & sorted</span>
          </div>
          <div className="rule">
            <span className="rule-icon">🏷️</span>
            <span>Hint phase: assign one number token to signal a card you hold (2 of each number available)</span>
          </div>
          <div className="rule">
            <span className="rule-icon">⚡</span>
            <span>Play phase: take turns playing cards in sequence (1,1,1,1 → 2,2,2,2 → … → 12)</span>
          </div>
          <div className="rule">
            <span className="rule-icon">💥</span>
            <span>Wrong card = lose a life. Lose 3 lives = BOOM</span>
          </div>
        </div>

        <div className="player-select">
          <label>Number of Agents</label>
          <div className="player-buttons">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                className={`player-btn ${playerCount === n ? 'active' : ''}`}
                onClick={() => setPlayerCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="cards-per-player">
            {Math.floor(48 / playerCount)} cards per agent
          </p>
        </div>

        <button className="btn-primary btn-large" onClick={() => onStart(playerCount)}>
          START MISSION
        </button>
      </div>
    </div>
  )
}
