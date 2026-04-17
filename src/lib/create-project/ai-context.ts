export function looksLikeAiContextLeak(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false

  const lower = trimmed.toLowerCase()
  const markers = [
    'current_draft_json:',
    'recent_chat_history:',
    'user_message:',
    'assistant_message:',
    'what would you like me to add next?',
    'i filled the title',
  ]

  if (markers.some(marker => lower.includes(marker))) {
    return true
  }

  if (!trimmed.startsWith('{')) {
    return false
  }

  const jsonFieldHints = [
    '"title"',
    '"description"',
    '"image"',
    '"impactlocation"',
    '"categoryids"',
    '"socialmedia"',
    '"recipientaddresses"',
  ]

  return (
    jsonFieldHints.filter(hint => lower.includes(hint.toLowerCase())).length >=
    3
  )
}
