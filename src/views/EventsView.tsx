import React from 'react'
import {
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import type { SceneEvent } from '../domain/contracts'

export interface EventsViewProps {
  apiScenes: SceneEvent[]
  fetchData: () => void
  eventsSearchQuery: string
  setEventsSearchQuery: (q: string) => void
  eventsSceneFilter: string
  setEventsSceneFilter: (f: string) => void
  eventsDateFilter: string
  setEventsDateFilter: (d: string) => void
  eventsOrderBy: 'time_desc' | 'time_asc' | 'confidence_desc' | 'scene_desc' | 'room_asc'
  setEventsOrderBy: (
    o: 'time_desc' | 'time_asc' | 'confidence_desc' | 'scene_desc' | 'room_asc'
  ) => void
  eventsCurrentPage: number
  setEventsCurrentPage: React.Dispatch<React.SetStateAction<number>>
  eventsPerPage: number
  setEventsPerPage: (n: number) => void
  setSelectedEventForInspection: (event: SceneEvent) => void
}

export const EventsView: React.FC<EventsViewProps> = ({
  apiScenes,
  fetchData,
  eventsSearchQuery,
  setEventsSearchQuery,
  eventsSceneFilter,
  setEventsSceneFilter,
  eventsDateFilter,
  setEventsDateFilter,
  eventsOrderBy,
  setEventsOrderBy,
  eventsCurrentPage,
  setEventsCurrentPage,
  eventsPerPage,
  setEventsPerPage,
  setSelectedEventForInspection,
}) => {
  // Computed Filtered, Sorted & Paginated Events List
  const filteredEvents = apiScenes.filter((scene) => {
    if (eventsSceneFilter !== 'all' && scene.scene !== eventsSceneFilter) {
      return false
    }
    if (eventsDateFilter) {
      const eventDate = new Date(scene.createdAt).toISOString().split('T')[0]
      if (eventDate !== eventsDateFilter) return false
    }
    if (eventsSearchQuery.trim()) {
      const query = eventsSearchQuery.toLowerCase()
      const roomMatch = scene.roomId.toLowerCase().includes(query)
      const sceneMatch = scene.scene.toLowerCase().includes(query)
      const personMatch = (
        scene.identity?.name ||
        (scene.identity?.identity === 'unknown' ? 'unknown visitor' : '')
      )
        .toLowerCase()
        .includes(query)
      const contextMatch = (scene.contextText || '').toLowerCase().includes(query)
      if (!roomMatch && !sceneMatch && !personMatch && !contextMatch) {
        return false
      }
    }
    return true
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (eventsOrderBy === 'time_desc') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    if (eventsOrderBy === 'time_asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    }
    if (eventsOrderBy === 'confidence_desc') {
      return b.confidence - a.confidence
    }
    if (eventsOrderBy === 'scene_desc') {
      const rank: Record<string, number> = {
        S4_CRITICAL: 4,
        S3_HELP: 3,
        S2_WATCH: 2,
        S1_NORMAL: 1,
      }
      return (rank[b.scene] || 0) - (rank[a.scene] || 0)
    }
    if (eventsOrderBy === 'room_asc') {
      return a.roomId.localeCompare(b.roomId)
    }
    return 0
  })

  const totalEventPages = Math.max(1, Math.ceil(sortedEvents.length / eventsPerPage))
  const paginatedEvents = sortedEvents.slice(
    (eventsCurrentPage - 1) * eventsPerPage,
    eventsCurrentPage * eventsPerPage
  )

  return (
    <div className="page-view">
      <div className="view-header">
        <div>
          <h1>Event History & AI Context Logs</h1>
          <p>
            Full chronological stream of Ring events, Scene Classifications, and Nova Micro
            explanations
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="sim-button" onClick={fetchData}>
            <RefreshCw size={14} /> Refresh Events
          </button>
        </div>
      </div>

      <div className="card-box">
        {/* Search, Filter & Order Toolbar */}
        <div className="table-filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              className="form-input table-filter-input"
              style={{ paddingLeft: '32px' }}
              placeholder="Search room, resident, or AI summary..."
              value={eventsSearchQuery}
              onChange={(e) => {
                setEventsSearchQuery(e.target.value)
                setEventsCurrentPage(1)
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} style={{ color: '#64748b' }} />
            <select
              className="form-select"
              style={{ minWidth: '130px', background: '#fff' }}
              value={eventsSceneFilter}
              onChange={(e) => {
                setEventsSceneFilter(e.target.value)
                setEventsCurrentPage(1)
              }}
            >
              <option value="all">All Scenes (S1-S4)</option>
              <option value="S1_NORMAL">S1 Normal</option>
              <option value="S2_WATCH">S2 Watch</option>
              <option value="S3_HELP">S3 Help</option>
              <option value="S4_CRITICAL">S4 Critical</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} style={{ color: '#64748b' }} />
            <input
              type="date"
              className="form-input"
              style={{ background: '#fff', minWidth: '135px' }}
              value={eventsDateFilter}
              onChange={(e) => {
                setEventsDateFilter(e.target.value)
                setEventsCurrentPage(1)
              }}
            />
            {eventsDateFilter && (
              <button
                type="button"
                className="btn-icon-action"
                title="Clear Date"
                onClick={() => setEventsDateFilter('')}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} style={{ color: '#64748b' }} />
            <select
              className="form-select"
              style={{ minWidth: '160px', background: '#fff' }}
              value={eventsOrderBy}
              onChange={(e) => setEventsOrderBy(e.target.value as any)}
            >
              <option value="time_desc">Order: Newest First</option>
              <option value="time_asc">Order: Oldest First</option>
              <option value="confidence_desc">Order: Confidence (High-Low)</option>
              <option value="scene_desc">Order: Severity (S4 → S1)</option>
              <option value="room_asc">Order: Room Name (A-Z)</option>
            </select>
          </div>

          {(eventsSearchQuery || eventsSceneFilter !== 'all' || eventsDateFilter) && (
            <button
              type="button"
              className="sim-button secondary"
              style={{ padding: '6px 12px', fontSize: '11px' }}
              onClick={() => {
                setEventsSearchQuery('')
                setEventsSceneFilter('all')
                setEventsDateFilter('')
                setEventsCurrentPage(1)
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Events Table */}
        <table className="table-responsive">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Room</th>
              <th>Scene Code</th>
              <th>Confidence</th>
              <th>Resident / Subject</th>
              <th>AI Context Summary (Nova Micro)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((s) => (
                <tr
                  key={s.sceneId}
                  className="clickable-event-row"
                  onClick={() => setSelectedEventForInspection(s)}
                  title="Click to inspect event snapshot & AI telemetry"
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <strong>{new Date(s.createdAt).toLocaleTimeString()}</strong>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    <strong>{s.roomId.replace('_', ' ')}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        s.scene === 'S1_NORMAL'
                          ? 'normal'
                          : s.scene === 'S2_WATCH'
                          ? 'watch'
                          : 'critical'
                      }`}
                    >
                      {s.scene}
                    </span>
                  </td>
                  <td>{Math.round(s.confidence * 100)}%</td>
                  <td>
                    <strong>
                      {s.identity?.name ??
                        (s.identity?.identity === 'unknown' ? 'Unknown Visitor' : 'No Subject')}
                    </strong>
                    {s.identity?.identity && (
                      <small style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>
                        {s.identity.identity}
                      </small>
                    )}
                  </td>
                  <td style={{ maxWidth: '400px', lineHeight: 1.4 }}>{s.contextText}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn-icon-action primary"
                      title="Inspect Snapshot & Telemetry"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        width: 'auto',
                        padding: '4px 8px',
                        fontSize: '11px',
                      }}
                      onClick={() => setSelectedEventForInspection(s)}
                    >
                      <Eye size={12} /> Inspect
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>
                  {filteredEvents.length === 0 && apiScenes.length > 0
                    ? 'No events match your current filter query.'
                    : 'No events recorded yet. Trigger from Overview demo or Settings pipeline.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls Footer */}
        <div className="table-pagination-footer">
          <div>
            Showing {sortedEvents.length > 0 ? (eventsCurrentPage - 1) * eventsPerPage + 1 : 0} to{' '}
            {Math.min(eventsCurrentPage * eventsPerPage, sortedEvents.length)} of {sortedEvents.length}{' '}
            events
            {sortedEvents.length !== apiScenes.length && ` (filtered from ${apiScenes.length} total)`}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>Per page:</span>
              <select
                className="form-select"
                style={{ padding: '4px 8px', fontSize: '12px', background: '#fff' }}
                value={eventsPerPage}
                onChange={(e) => {
                  setEventsPerPage(Number(e.target.value))
                  setEventsCurrentPage(1)
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="pagination-nav-group">
              <button
                type="button"
                className="page-nav-btn"
                disabled={eventsCurrentPage <= 1}
                onClick={() => setEventsCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={13} /> Prev
              </button>

              {Array.from({ length: totalEventPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, eventsCurrentPage - 3),
                  Math.min(totalEventPages, eventsCurrentPage + 2)
                )
                .map((pageNum) => (
                  <button
                    type="button"
                    key={pageNum}
                    className={`page-nav-btn ${eventsCurrentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setEventsCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

              <button
                type="button"
                className="page-nav-btn"
                disabled={eventsCurrentPage >= totalEventPages}
                onClick={() => setEventsCurrentPage((p) => Math.min(totalEventPages, p + 1))}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
