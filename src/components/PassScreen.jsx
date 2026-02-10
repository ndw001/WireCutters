import React from 'react'

export default function PassScreen({ state, onConfirm }) {
  const { passTo, passNextPhase, players } = state
  const player = players[passTo]
  const phaseLabel = passNextPhase === 'hint' ? 'HINT PHASE' : 'PLAY PHASE'

  return (
    <div className="screen pass-screen">
      <div className="pass-card">
        <div className="pass-bomb">💣</div>
        <div className="pass-direction">PASS THE DEVICE TO</div>
        <div className="pass-name">{player.name}</div>
        <div className="pass-phase-badge">{phaseLabel}</div>
        <p className="pass-note">
          {passNextPhase === 'hint'
            ? "You'll choose one tile to publicly hint to the team."
            : "Select one of your tiles, then tap a teammate's face-down tile to attempt a cut."}
        </p>
        <button className="btn-primary btn-large" onClick={onConfirm}>
          I'M {player.name.toUpperCase()} — READY
        </button>
      </div>
    </div>
  )
}
