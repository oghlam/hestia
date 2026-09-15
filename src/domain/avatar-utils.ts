import type { Resident, CareTeamMember, Asset } from './contracts'

/**
 * Get the avatar URL for a resident
 * If resident has primaryAvatarAssetId, returns the asset's fileUrl
 * Otherwise returns undefined (falls back to default/generated avatar)
 */
export function getResidentAvatarUrl(resident: Resident, assetMap?: Map<string, Asset>): string | undefined {
  if (!resident.primaryAvatarAssetId) {
    return undefined
  }

  if (assetMap) {
    const asset = assetMap.get(resident.primaryAvatarAssetId)
    return asset?.fileUrl
  }

  // If no assetMap provided, return asset ID as placeholder
  // The component should fetch the asset separately
  return undefined
}

/**
 * Get the avatar URL for a care team member
 * Prioritizes avatarAssetId over avatarUrl
 */
export function getCareTeamAvatarUrl(member: CareTeamMember, assetMap?: Map<string, Asset>): string | undefined {
  if (member.avatarAssetId && assetMap) {
    const asset = assetMap.get(member.avatarAssetId)
    if (asset) {
      return asset.fileUrl
    }
  }

  // Fallback to direct avatarUrl (for backward compatibility)
  return member.avatarUrl
}

/**
 * Check if a resident has a real photo avatar (not generated)
 */
export function hasRealAvatar(resident: Resident): boolean {
  return !!resident.primaryAvatarAssetId
}

/**
 * Check if a care team member has a real photo avatar
 */
export function hasRealTeamAvatar(member: CareTeamMember): boolean {
  return !!member.avatarAssetId
}
