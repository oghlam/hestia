import React from 'react'
import type { Scene } from '../../domain/mock-data'

export function SceneDot({ status }: { status: Scene }) {
  return <span className={`scene-dot ${status.toLowerCase()}`} />
}

export function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="panel">
      <div className="panel-title">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

export function Status({
  icon,
  title,
  value,
  muted,
}: {
  icon: React.ReactNode
  title: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="status-item">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small className={muted ? 'muted-status' : ''}>
          <i /> {value}
        </small>
      </div>
    </div>
  )
}
