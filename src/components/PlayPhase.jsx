import React from 'react'
import { getSoloCutOptions, TOTAL_TILES, MAX_LIVES, CARD_MAX, COPIES } from '../game/logic'

// ── Lives indicator ────────────────────────────────────────────────────────
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

// ── Wires progress grid ────────────────────────────────────────────────────
function WiresProgress({ players }) {
  // Count remaining tiles per number across all players
  const remaining = {}
  players.forEach(p =>
    p.tiles.forEach(t => { remaining[t.value] = (remaining[t.value] || 0) + 1 })
  )
  const totalLeft = Object.values(remaining).reduce((s, v) => s + v, 0)
  const totalCut = TOTAL_TILES - totalLeft
  const pct = Math.round((totalCut / TOTAL_TILES) * 100)

  return (
    <div className="progress-section">
      <div className="progress-label">
        <span>WIRES CUT</span>
        <span>{totalCut} / {TOTAL_TILES}</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="wires-grid">
        {Array.from({ length: CARD_MAX }, (_, i) => i + 1).map(n => {
          const rem = remaining[n] || 0
          const cut = COPIES - rem
          const cleared = rem === 0
          const partial = cut > 0 && !cleared
          return (
            <div key={n} className={`wire-chip ${cleared ? 'cleared' : partial ? 'partial' : ''}`}>
              <span className="wire-num">{n}</span>
              <div className="wire-pips">
                {Array.from({ length: COPIES }, (_, j) => (
                  <span key={j} className={`pip ${j < cut ? 'filled' : ''}`} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Another player's rack (face-down tiles) ────────────────────────────────
function OtherPlayerRack({ player, isTargeting, onTileClick }) {
  return (
    <div className={`player-rack other-rack ${isTargeting ? 'rack-targeting' : ''}`}>
      <div className="rack-label">
        {player.name}
        <span className="rack-count">{player.tiles.length} tiles</span>
      </div>
      <div className="rack-tiles">
        {player.tiles.map((tile, i) => (
          <button
            key={i}
            className={`tile-back ${tile.hintToken !== null ? 'tile-has-info' : ''} ${isTargeting ? 'tile-targetable' : ''}`}
            onClick={() => isTargeting && onTileClick(i)}
          >
            {tile.hintToken !== null
              ? <span className="info-token">{tile.hintToken}</span>
              : <span className="tile-q">?</span>
            }
          </button>
        ))}
        {player.tiles.length === 0 && (
          <span className="rack-empty">✓ cleared</span>
        )}
      </div>
      {isTargeting && (
        <div className="rack-targeting-label">← tap a tile to attempt cut</div>
      )}
    </div>
  )
}

// ── Result overlay ─────────────────────────────────────────────────────────
function ResultOverlay({ lastAction, onContinue, players, currentPlayerIndex }) {
  const { type, myValue, targetValue, targetPlayerName, value, count } = lastAction
  const isSuccess = type === 'dual-match' || type === 'solo'

  let icon, title, detail
  if (type === 'dual-match') {
    icon = '✓'; title = 'WIRE CUT!'
    detail = `Your ${myValue} matched ${targetPlayerName}'s ${targetValue}. Both tiles removed.`
  } else if (type === 'dual-miss') {
    icon = '✗'; title = 'WRONG WIRE!'
    detail = `You played ${myValue} — they had a ${targetValue}. Info token placed. Countdown advances!`
  } else {
    icon = '✓'; title = 'SOLO CUT!'
    detail = `You held all ${count} remaining cop${count === 1 ? 'y' : 'ies'} of ${value}. Cut!`
  }

  return (
    <div className={`result-overlay ${isSuccess ? 'success' : 'fail'}`}>
      <div className="result-content">
        <div className="result-icon">{icon}</div>
        <div className="result-title">{title}</div>
        <div className="result-detail">{detail}</div>
        <button className="btn-primary" onClick={onContinue}>CONTINUE</button>
      </div>
    </div>
  )
}

// ── Main play phase ────────────────────────────────────────────────────────
export default function PlayPhase({ state, onSelectTile, onMatchTile, onSoloCut, onContinue }) {
  const { players, currentPlayerIndex, selectedTile, lastAction, lives } = state
  const currentPlayer = players[currentPlayerIndex]
  const otherPlayers = players.filter(p => p.id !== currentPlayerIndex)
  const soloCuts = getSoloCutOptions(players, currentPlayerIndex)
  const isTargeting = selectedTile !== null
  const selectedValue = isTargeting ? currentPlayer.tiles[selectedTile]?.value : null

  return (
    <div className="screen play-screen">
      <header className="game-header">
        <div className="header-title">💣 BOMB BUSTERS</div>
        <LivesDisplay lives={lives} />
      </header>

      <WiresProgress players={players} />

      {/* Other players' racks — face-down */}
      {otherPlayers.map(p => (
        <OtherPlayerRack
          key={p.id}
          player={p}
          isTargeting={isTargeting}
          onTileClick={(tileIdx) => onMatchTile(p.id, tileIdx)}
        />
      ))}

      {/* Current player's rack — face-up, always visible */}
      <div className="player-rack own-rack">
        <div className="rack-label">
          <span className="own-label">YOUR TILES</span>
          <span className="own-name">{currentPlayer.name}</span>
          <span className="rack-count">{currentPlayer.tiles.length} tiles</span>
        </div>

        {isTargeting && (
          <div className="targeting-banner">
            Holding [{selectedValue}] — tap any face-down tile above to attempt a cut, or tap your tile again to cancel
          </div>
        )}

        <div className="rack-tiles">
          {currentPlayer.tiles.map((tile, i) => (
            <button
              key={i}
              className={`tile-own ${selectedTile === i ? 'tile-selected' : ''} ${tile.hintToken !== null ? 'tile-hinted' : ''}`}
              onClick={() => onSelectTile(i)}
            >
              {tile.value}
              {tile.hintToken !== null && <span className="tile-star">★</span>}
            </button>
          ))}
          {currentPlayer.tiles.length === 0 && (
            <span className="rack-empty">✓ all cut!</span>
          )}
        </div>

        {/* Solo cut options */}
        {soloCuts.length > 0 && (
          <div className="solo-cut-row">
            <span className="solo-label">SOLO CUT</span>
            {soloCuts.map(v => (
              <button key={v} className="btn-solo" onClick={() => onSoloCut(v)}>
                all {v}s
              </button>
            ))}
          </div>
        )}
      </div>

      {lastAction && (
        <ResultOverlay
          lastAction={lastAction}
          onContinue={onContinue}
          players={players}
          currentPlayerIndex={currentPlayerIndex}
        />
      )}
    </div>
  )
}
