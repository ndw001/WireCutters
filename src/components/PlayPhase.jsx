import React from 'react'
import { getNextNeeded, getTotalPlayed, TOTAL_CARDS, MAX_LIVES, CARD_MAX, COPIES_PER_NUMBER } from '../game/logic'

function LivesDisplay({ lives }) {
  return (
    <div className="lives-display">
      {Array.from({ length: MAX_LIVES }, (_, i) => (
        <span key={i} className={`life-icon ${i < lives ? 'alive' : 'dead'}`}>
          {i < lives ? '🔋' : '💀'}
        </span>
      ))}
    </div>
  )
}

function ProgressBar({ playedCount }) {
  const total = getTotalPlayed(playedCount)
  const pct = Math.round((total / TOTAL_CARDS) * 100)
  return (
    <div className="progress-section">
      <div className="progress-label">
        <span>DEFUSE PROGRESS</span>
        <span>{total} / {TOTAL_CARDS}</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function SequenceDisplay({ playedCount }) {
  const nextNeeded = getNextNeeded(playedCount)
  return (
    <div className="sequence-display">
      {Array.from({ length: CARD_MAX }, (_, i) => {
        const n = i + 1
        const played = playedCount[n]
        const isNext = n === nextNeeded
        const done = played === COPIES_PER_NUMBER
        return (
          <div
            key={n}
            className={`seq-slot ${done ? 'done' : ''} ${isNext ? 'next' : ''} ${played > 0 && !done ? 'partial' : ''}`}
          >
            <span className="seq-num">{n}</span>
            <div className="seq-pips">
              {Array.from({ length: COPIES_PER_NUMBER }, (_, j) => (
                <span key={j} className={`pip ${j < played ? 'filled' : ''}`} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HintTokensDisplay({ players, currentPlayerIndex }) {
  return (
    <div className="hints-display">
      <div className="hints-label">AGENT INTEL</div>
      <div className="hints-row">
        {players.map(p => (
          <div key={p.id} className={`agent-card ${p.id === currentPlayerIndex ? 'active-agent' : ''}`}>
            <div className="agent-name">{p.name}</div>
            <div className={`agent-hint ${p.hintToken !== null ? 'has-hint' : 'no-hint'}`}>
              {p.hintToken !== null ? (
                <><span className="hint-label">HAS</span><span className="hint-val">{p.hintToken}</span></>
              ) : (
                <span className="no-hint-text">no intel</span>
              )}
            </div>
            <div className="agent-cards">{p.hand.length} cards</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ResultOverlay({ lastAction, onContinue }) {
  const { result, card, needed } = lastAction
  const isSuccess = result === 'success'
  return (
    <div className={`result-overlay ${isSuccess ? 'success' : 'fail'}`}>
      <div className="result-content">
        <div className="result-icon">{isSuccess ? '✓' : '✗'}</div>
        <div className="result-title">{isSuccess ? 'WIRE CUT!' : 'WRONG WIRE!'}</div>
        <div className="result-detail">
          {isSuccess
            ? `${card} — correct. Keep going.`
            : `Played ${card}, needed ${needed}. Life lost!`}
        </div>
        <button className="btn-primary" onClick={onContinue}>CONTINUE</button>
      </div>
    </div>
  )
}

export default function PlayPhase({ state, onReveal, onPlayCard, onNextTurn }) {
  const { players, playedCount, lives, currentPlayerIndex, handRevealed, lastAction } = state
  const currentPlayer = players[currentPlayerIndex]
  const nextNeeded = getNextNeeded(playedCount)

  return (
    <div className="screen play-screen">
      <header className="game-header">
        <div className="header-title">💣 BOMB BUSTERS</div>
        <LivesDisplay lives={lives} />
      </header>

      <ProgressBar playedCount={playedCount} />
      <SequenceDisplay playedCount={playedCount} />
      <HintTokensDisplay players={players} currentPlayerIndex={currentPlayerIndex} />

      <div className="turn-panel">
        <div className="turn-header">
          <div className="turn-name">{currentPlayer.name}'s Turn</div>
          <div className="needed-badge">
            Next needed: <strong>{nextNeeded}</strong>
          </div>
        </div>

        {!handRevealed ? (
          <div className="hidden-hand">
            <p className="pass-instruction">Pass device to {currentPlayer.name}</p>
            <button className="btn-primary btn-large" onClick={onReveal}>
              REVEAL MY HAND
            </button>
          </div>
        ) : (
          <div className="hand-view">
            <p className="hand-instruction">Tap a card to play it</p>
            <div className="hand-cards">
              {currentPlayer.hand.map((card, idx) => (
                <button
                  key={idx}
                  className={`card-btn ${card === nextNeeded ? 'card-correct' : ''}`}
                  onClick={() => onPlayCard(card)}
                >
                  {card}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lastAction && (
        <ResultOverlay lastAction={lastAction} onContinue={onNextTurn} />
      )}
    </div>
  )
}
