import { cvToJSON } from '@stacks/transactions'

export async function fetchStacksTipHeight(hiroApiUrl) {
  const res = await fetch(`${hiroApiUrl}/v2/info`)
  if (!res.ok) throw new Error('Failed to fetch Stacks chain info')
  const json = await res.json()
  if (typeof json?.stacks_tip_height !== 'number') {
    throw new Error('Unexpected /v2/info response')
  }
  return json.stacks_tip_height
}

export function optionalFromClarityJson(clarityJson) {
  if (!clarityJson) return null
  // `cvToJSON` represents optionals as:
  // { type: 'optional', value: { type: 'none' } }
  // { type: 'optional', value: { type: 'some', value: <inner> } }
  if (clarityJson.type === 'optional') {
    const inner = clarityJson.value
    if (!inner) return null
    if (inner.type === 'none') return null
    if (inner.type === 'some') return inner.value
    return null
  }

  // Defensive: handle already-unwrapped shapes
  if (clarityJson.type === 'none') return null
  if (clarityJson.type === 'some') return clarityJson.value
  return null
}
