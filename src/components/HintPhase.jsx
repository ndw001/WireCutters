import React, { useState } from 'react'
import { CARD_MIN, CARD_MAX } from '../game/logic'

export default function HintPhase({ state, onAssign, onPass }) {
  const { players, hintPool, currentPlayerIndex, playerCount } = state
  const currentPlayer = players[currentPlayerIndex]
  const [selected, setSelected] = useState(null)

  const availableNumbers = []
  for (let n = CARD_MIN; n <= CARD_MAX; n++) {
    if (hintPool[n] > 0) availableNumbers.push(n)
  }

  function handleAssign() {
    if (selected !== null) {
      onAssign(selected)
      setSelected(null)
    }
  }

  return (
    <div className="screen">
      <header className="game-header">
        <div className="header-title">💣 BOMB BUSTERS</div>
        <div className="header-phase">HINT PHASE</div>
      </header>

      {/* All players' assigned hints */}
      <div className="all-hints-row">
        {players.map(p => (
          <div key={p.id} className={`player-hint-badge ${p.id === currentPlayerIndex ? 'current' : ''}`}>
            <span className="player-label">{p.name}</span>
            <span className={`hint-chip ${p.hintToken !== null ? 'assigned' : 'empty'}`}>
              {p.hintToken !== null ? p.hintToken : '?'}
            </span>
          </div>
        ))}
      </div>

      <div className="hint-card">
        <div className="turn-banner">
          {currentPlayer.name}'s turn
          <span className="turn-sub">({currentPlayerIndex + 1} of {playerCount})</span>
        </div>

        <p className="hint-instruction">
          Pick a number token that matches a card in your hand. Your token will be visible to all other agents.
        </p>

        <div className="hint-grid">
          {Array.from({ length: CARD_MAX }, (_, i) => i + 1).map(n => {
            const available = hintPool[n] > 0
            return (
              <button
                key={n}
                className={`hint-token ${selected === n ? 'selected' : ''} ${!available ? 'used' : ''}`}
                onClick={() => available && setSelected(n === selected ? null : n)}
                disabled={!available}
              >
                <span className="token-num">{n}</span>
                {hintPool[n] < 2 && available && (
                  <span className="token-remaining">1 left</span>
                )}
                {!available && <span className="token-remaining">gone</span>}
              </button>
            )
          })}
        </div>

        <div className="hint-actions">
          <button
            className="btn-primary"
            onClick={handleAssign}
            disabled={selected === null}
          >
            ASSIGN TOKEN [{selected ?? '—'}]
          </button>
          <button className="btn-ghost" onClick={onPass}>
            PASS (no hint)
          </button>
        </div>
      </div>
    </div>
  )
}
