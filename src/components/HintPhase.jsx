import React from 'react'

export default function HintPhase({ state, onAssign, onPass }) {
  const { players, hintPool, currentPlayerIndex, playerCount } = state
  const currentPlayer = players[currentPlayerIndex]
  const otherPlayers = players.filter(p => p.id !== currentPlayerIndex)

  return (
    <div className="screen">
      <header className="game-header">
        <div className="header-title">💣 BOMB BUSTERS</div>
        <div className="header-phase">HINT PHASE — {currentPlayerIndex + 1} / {playerCount}</div>
      </header>

      {/* Other players' tiles — face-down, show any already-placed hints */}
      {otherPlayers.length > 0 && (
        <div className="other-players-strip">
          {otherPlayers.map(p => (
            <div key={p.id} className="strip-player">
              <div className="strip-name">{p.name}</div>
              <div className="strip-tiles">
                {p.tiles.map((tile, i) => (
                  <div key={i} className={`tile-back-sm ${tile.hintToken !== null ? 'tile-back-hinted' : ''}`}>
                    {tile.hintToken !== null ? tile.hintToken : '?'}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="hint-card">
        <div className="turn-banner">
          {currentPlayer.name}
          <span className="turn-sub"> — choose a tile to hint</span>
        </div>
        <p className="hint-instruction">
          Tap one of your tiles to place a public info token on it.
          Other agents will see that token — it reveals that tile's number to the team.
          Grayed tiles can't be hinted (token pool exhausted for that number).
        </p>

        <div className="hint-tiles-row">
          {currentPlayer.tiles.map((tile, i) => {
            const poolEmpty = hintPool[tile.value] <= 0
            const alreadyHinted = tile.hintToken !== null
            const disabled = poolEmpty || alreadyHinted
            return (
              <button
                key={i}
                className={`tile-own ${alreadyHinted ? 'tile-hinted' : ''} ${disabled && !alreadyHinted ? 'tile-disabled' : ''}`}
                onClick={() => !disabled && onAssign(i)}
                disabled={disabled}
                title={poolEmpty ? `No more hints available for ${tile.value}` : ''}
              >
                {tile.value}
                {alreadyHinted && <span className="tile-star">★</span>}
                {!alreadyHinted && !poolEmpty && (
                  <span className="pool-left">×{hintPool[tile.value]}</span>
                )}
              </button>
            )
          })}
        </div>

        <button className="btn-ghost" onClick={onPass}>
          PASS — no hint this turn
        </button>
      </div>
    </div>
  )
}
