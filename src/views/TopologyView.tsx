import React, { useState } from 'react'
import {
  Activity,
  ArrowDown,
  Camera,
  CheckCircle2,
  Cpu,
  Eye,
  HeartPulse,
  Layers,
  Lock,
  Network,
  Radio,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  User,
  Users,
  Video,
  Wifi,
  Zap,
} from 'lucide-react'
import type { DrawerEntity } from '../components/layout/ContextualDrawer'

export interface TopologyViewProps {
  onSelectNodeForDrawer: (entity: DrawerEntity) => void
}

export const TopologyView: React.FC<TopologyViewProps> = ({ onSelectNodeForDrawer }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-bedrock')
  const [trafficSimulating, setTrafficSimulating] = useState(true)

  const nodes = [
    // Tier 1: Cloud & AI
    {
      id: 'node-ring-cloud',
      tier: 'cloud',
      label: 'Ring Cloud Services',
      sublabel: 'Webhook Stream & HMAC-SHA256',
      icon: Radio,
      status: 'online' as const,
      latency: 24,
      throughput: '1.2 Mbps',
      details: 'Ingests real-time motion and doorbell ring events from Ring Partner API over HTTPS with constant-time HMAC-SHA256 verification.',
    },
    {
      id: 'node-bedrock',
      tier: 'cloud',
      label: 'AWS Bedrock (Nova Micro)',
      sublabel: 'Structured Elder Context AI',
      icon: Cpu,
      status: 'online' as const,
      latency: 95,
      throughput: '0.4 Mbps',
      details: 'Generates concise clinical context summaries for caregiver triage using Amazon Nova Micro with zero image data transmission.',
    },
    {
      id: 'node-dynamodb',
      tier: 'cloud',
      label: 'Amazon DynamoDB',
      sublabel: 'us-east-1 Hybrid Persistence',
      icon: Server,
      status: 'online' as const,
      latency: 18,
      throughput: '0.8 Mbps',
      details: 'Cloud persistent store synchronized with local memory fallback and 2-Factor MFA token security.',
    },

    // Tier 2: Gateway / Hub
    {
      id: 'node-gateway',
      tier: 'gateway',
      label: 'Ring Home Gateway / Base',
      sublabel: 'Site IP 192.168.1.1 · Greenwood',
      icon: Network,
      status: 'online' as const,
      latency: 4,
      throughput: '4.8 Mbps',
      details: 'Local network bridge connecting all sub-zoned Ring IoT hardware to cloud webhook brokers.',
    },

    // Tier 3: Room Devices & Sensors
    {
      id: 'node-cam-living',
      tier: 'device',
      label: 'Living Room Cam (Plus)',
      sublabel: '192.168.1.110 · Indoor Cam',
      icon: Camera,
      status: 'online' as const,
      latency: 6,
      throughput: '1.8 Mbps',
      details: 'Primary coverage area for daytime routine, sofa rest, and mobility observation.',
    },
    {
      id: 'node-cam-bed',
      tier: 'device',
      label: 'Bedroom Cam (Pro)',
      sublabel: '192.168.1.111 · Indoor Cam',
      icon: Camera,
      status: 'online' as const,
      latency: 5,
      throughput: '1.4 Mbps',
      details: 'Sleep cycle monitor, night wandering detection, and inactivity guard.',
    },
    {
      id: 'node-cam-entry',
      tier: 'device',
      label: 'Front Doorbell (Elite)',
      sublabel: '192.168.1.113 · Video Doorbell',
      icon: Video,
      status: 'online' as const,
      latency: 8,
      throughput: '1.2 Mbps',
      details: 'Monitors visitor arrivals, postal delivery, and unrecognized guest observation.',
    },

    // Tier 4: Resident Vision & Pose Engine
    {
      id: 'node-vision-target',
      tier: 'target',
      label: 'Target Elder Recognition',
      sublabel: '64-d Face Embedding Match',
      icon: Eye,
      status: 'online' as const,
      latency: 12,
      throughput: '30 FPS',
      details: 'Verifies resident identity against trained face templates. Unknown entities classified safely as visitors without siren escalation.',
    },

    // Tier 5: Care Team Dispatch Loop
    {
      id: 'node-care-loop',
      tier: 'care',
      label: 'Caregiver Validation Loop',
      sublabel: 'Primary: Caregiver (SLA 90s)',
      icon: HeartPulse,
      status: 'online' as const,
      latency: 45,
      throughput: 'Push / WhatsApp',
      details: 'Fast Action mobile interface dispatching alerts to Primary Caregiver, on-duty Nurse, and Emergency Doctor contacts.',
    },
  ]

  const handleNodeClick = (n: typeof nodes[0]) => {
    setSelectedNodeId(n.id)
    onSelectNodeForDrawer({
      type: 'node',
      data: {
        id: n.id,
        label: n.label,
        nodeType: n.tier.toUpperCase(),
        status: n.status,
        latencyMs: n.latency,
        throughput: n.throughput,
        details: n.details,
      },
    })
  }

  return (
    <div className="page-view controller-theme">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="flex-row items-center gap-2">
            <h1>Care Topology Mesh</h1>
            <span className="badge normal">Mesh Synchronized</span>
          </div>
          <p>End-to-end interactive hierarchy: Cloud Infrastructure → Edge Gateway → Ring Hardware → Elder Vision → Caregiver Dispatch.</p>
        </div>
        <div className="flex-row gap-2">
          <button
            className={`sim-button ${trafficSimulating ? 'secondary' : ''}`}
            onClick={() => setTrafficSimulating(!trafficSimulating)}
          >
            <Activity size={14} /> {trafficSimulating ? 'Traffic Active' : 'Traffic Paused'}
          </button>
        </div>
      </div>

      {/* KPI Topology Stats Bar */}
      <div className="controller-kpi-grid">
        <div className="controller-kpi-card">
          <div className="kpi-label">Topology Health</div>
          <div className="kpi-value text-emerald-700">100% Optimal</div>
          <div className="kpi-subtext">9 Active Mesh Nodes</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">Mean Link Latency</div>
          <div className="kpi-value">14.8 ms</div>
          <div className="kpi-subtext">Sub-second Alert Relay</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">HMAC Pipeline</div>
          <div className="kpi-value text-emerald-700">Verified</div>
          <div className="kpi-subtext">Constant-time SHA-256</div>
        </div>
        <div className="controller-kpi-card">
          <div className="kpi-label">Care SLA Compliance</div>
          <div className="kpi-value">99.4%</div>
          <div className="kpi-subtext">Avg Response 28s</div>
        </div>
      </div>

      {/* Interactive Topology Canvas */}
      <div className="card-box topology-canvas-container">
        <div className="topology-legend">
          <span className="legend-item"><span className="legend-dot cloud" /> Cloud / AI Layer</span>
          <span className="legend-item"><span className="legend-dot gateway" /> Edge Gateway</span>
          <span className="legend-item"><span className="legend-dot device" /> Ring Hardware</span>
          <span className="legend-item"><span className="legend-dot target" /> Elder Vision Target</span>
          <span className="legend-item"><span className="legend-dot care" /> Caregiver Dispatch</span>
        </div>

        <div className="topology-tree">
          {/* Tier 1: Cloud Layer */}
          <div className="topology-tier tier-cloud">
            <div className="tier-badge">CLOUD & REASONING SERVICES</div>
            <div className="tier-nodes-row">
              {nodes.filter((n) => n.tier === 'cloud').map((n) => {
                const Icon = n.icon
                const isSelected = selectedNodeId === n.id
                return (
                  <div
                    key={n.id}
                    className={`topology-node-card ${n.tier} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleNodeClick(n)}
                  >
                    <div className="node-icon-circle">
                      <Icon size={16} />
                    </div>
                    <div className="node-text">
                      <strong>{n.label}</strong>
                      <small>{n.sublabel}</small>
                    </div>
                    <div className="node-telemetry">
                      <span className="badge normal">{n.latency}ms</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vertical Link Wire with animated pulse */}
          <div className="topology-connector-wire">
            <div className={`wire-pulse ${trafficSimulating ? 'active' : ''}`} />
          </div>

          {/* Tier 2: Gateway */}
          <div className="topology-tier tier-gateway">
            <div className="tier-badge">LOCAL RING EDGE GATEWAY</div>
            <div className="tier-nodes-row justify-center">
              {nodes.filter((n) => n.tier === 'gateway').map((n) => {
                const Icon = n.icon
                const isSelected = selectedNodeId === n.id
                return (
                  <div
                    key={n.id}
                    className={`topology-node-card ${n.tier} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleNodeClick(n)}
                  >
                    <div className="node-icon-circle">
                      <Icon size={16} />
                    </div>
                    <div className="node-text">
                      <strong>{n.label}</strong>
                      <small>{n.sublabel}</small>
                    </div>
                    <div className="node-telemetry">
                      <span className="badge normal">{n.throughput}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vertical Link Wire */}
          <div className="topology-connector-wire">
            <div className={`wire-pulse ${trafficSimulating ? 'active' : ''}`} />
          </div>

          {/* Tier 3: Ring Endpoints */}
          <div className="topology-tier tier-device">
            <div className="tier-badge">RING SPATIAL HARDWARE ENDPOINTS</div>
            <div className="tier-nodes-row">
              {nodes.filter((n) => n.tier === 'device').map((n) => {
                const Icon = n.icon
                const isSelected = selectedNodeId === n.id
                return (
                  <div
                    key={n.id}
                    className={`topology-node-card ${n.tier} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleNodeClick(n)}
                  >
                    <div className="node-icon-circle">
                      <Icon size={16} />
                    </div>
                    <div className="node-text">
                      <strong>{n.label}</strong>
                      <small>{n.sublabel}</small>
                    </div>
                    <div className="node-telemetry">
                      <span className="badge normal">{n.latency}ms</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vertical Link Wire */}
          <div className="topology-connector-wire">
            <div className={`wire-pulse ${trafficSimulating ? 'active' : ''}`} />
          </div>

          {/* Tier 4 & 5: Target Vision & Care Dispatch */}
          <div className="topology-bottom-row">
            <div className="topology-tier tier-target flex-1">
              <div className="tier-badge">ELDER RESIDENT VISION TARGET</div>
              {nodes.filter((n) => n.tier === 'target').map((n) => {
                const Icon = n.icon
                const isSelected = selectedNodeId === n.id
                return (
                  <div
                    key={n.id}
                    className={`topology-node-card ${n.tier} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleNodeClick(n)}
                  >
                    <div className="node-icon-circle">
                      <Icon size={16} />
                    </div>
                    <div className="node-text">
                      <strong>{n.label}</strong>
                      <small>{n.sublabel}</small>
                    </div>
                    <div className="node-telemetry">
                      <span className="badge info">{n.throughput}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="topology-horizontal-connector">
              <div className="arrow-head left" />
              <div className={`wire-pulse-h ${trafficSimulating ? 'active' : ''}`} />
              <div className="arrow-head right" />
            </div>

            <div className="topology-tier tier-care flex-1">
              <div className="tier-badge">CAREGIVER DISPATCH LOOP</div>
              {nodes.filter((n) => n.tier === 'care').map((n) => {
                const Icon = n.icon
                const isSelected = selectedNodeId === n.id
                return (
                  <div
                    key={n.id}
                    className={`topology-node-card ${n.tier} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleNodeClick(n)}
                  >
                    <div className="node-icon-circle">
                      <Icon size={16} />
                    </div>
                    <div className="node-text">
                      <strong>{n.label}</strong>
                      <small>{n.sublabel}</small>
                    </div>
                    <div className="node-telemetry">
                      <span className="badge normal">SLA Active</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
