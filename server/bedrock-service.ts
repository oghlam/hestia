import type { IdentityResult, RingEvent, SceneCode } from '../src/domain/contracts'

export interface BedrockContextRequest {
  scene: SceneCode
  event: RingEvent
  identity?: IdentityResult
  signals?: string[]
}

/**
 * Builds structured text prompt for Amazon Nova Micro.
 * Note: Nova Micro receives structured text only. Never image or video.
 */
export function buildNovaMicroPrompt(req: BedrockContextRequest): string {
  const subject = req.identity?.identity === 'known_target' ? req.identity.name ?? 'The resident' : 'An unknown person'
  const room = req.event.roomId.replaceAll('_', ' ')
  const sceneLabel = req.scene.replace('S1_', '').replace('S2_', '').replace('S3_', '').replace('S4_', '')

  return `You are HESTIA, a calm and reassuring elder-care AI assistant.
Summarize the following elder-care scene for family members in 1-2 concise, calm, and objective sentences.

Scene Classification: ${sceneLabel} (${req.scene})
Location: ${room}
Subject: ${subject}
Event Type: ${req.event.eventType}
Observed Signals: ${req.signals?.length ? req.signals.join(', ') : 'normal activity'}

Provide only the summary statement. Do not add conversational fluff or panic.`
}

/**
 * Deterministic fallback generator for when AWS Bedrock is in standby/offline.
 */
export function generateDeterministicSummary(req: BedrockContextRequest): string {
  const subject = req.identity?.identity === 'known_target' ? req.identity.name ?? 'Eleanor' : 'An unknown visitor'
  const roomName = req.event.roomId.replaceAll('_', ' ')

  switch (req.scene) {
    case 'S4_CRITICAL':
      return `Critical safety signal involving ${subject} in the ${roomName}. Immediate care team attention is requested.`
    case 'S3_HELP':
      return `Potential assistance needed for ${subject} in the ${roomName}. Caregiver verification is pending.`
    case 'S2_WATCH':
      return `Noticeable activity observed for ${subject} in the ${roomName}. Continuing watchful monitoring.`
    case 'S1_NORMAL':
    default:
      return `${subject} is in the ${roomName}. Activity appears calm and normal.`
  }
}

/**
 * Generates scene context summary using Amazon Nova Micro or deterministic fallback.
 */
export async function generateSceneContext(req: BedrockContextRequest): Promise<{ summary: string; provider: 'bedrock_nova_micro' | 'deterministic_fallback' }> {
  // Check if Bedrock endpoint/LiteLLM bridge is available
  const bedrockEndpoint = process.env.BEDROCK_ENDPOINT ?? (process.env.LITELLM_ENDPOINT ? `${process.env.LITELLM_ENDPOINT}/chat/completions` : undefined)
  const apiKey = process.env.BEDROCK_API_KEY ?? process.env.LITELLM_API_KEY

  if (bedrockEndpoint && apiKey) {
    try {
      const prompt = buildNovaMicroPrompt(req)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(bedrockEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.BEDROCK_MODEL_ID ?? 'amazon.nova-micro-v1:0',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.2,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const text = data.choices?.[0]?.message?.content?.trim()
        if (text) return { summary: text, provider: 'bedrock_nova_micro' }
      }
    } catch {
      // Fall through to deterministic generator on timeout/network error
    }
  }

  return {
    summary: generateDeterministicSummary(req),
    provider: 'deterministic_fallback',
  }
}
