export const getSocialMediaHandle = (
  socialMediaUrl: string,
  socialMediaType: string,
) => {
  let cleanedUrl = socialMediaUrl
    .replace(/^https?:\/\//, '')
    .replace('www.', '')

  // Remove trailing slash if present
  if (cleanedUrl.endsWith('/')) {
    cleanedUrl = cleanedUrl.slice(0, -1)
  }

  const lowerCaseType = socialMediaType.toLowerCase()

  switch (lowerCaseType) {
    case 'github':
      return extractUsernameFromPattern(
        cleanedUrl,
        /github\.com\/([^\/]+)/,
        false,
      )
    case 'x':
      return extractUsernameFromPattern(cleanedUrl, /x\.com\/([^\/]+)/, false)
    case 'facebook':
      return extractUsernameFromPattern(
        cleanedUrl,
        /facebook\.com\/([^\/]+)/,
        false,
      )
    case 'instagram':
      return extractUsernameFromPattern(
        cleanedUrl,
        /instagram\.com\/([^\/]+)/,
        false,
      )
    case 'linkedin':
      return extractUsernameFromPattern(
        cleanedUrl,
        /linkedin\.com\/(?:in|company)\/([^\/]+)/,
        false,
      )
    case 'youtube':
      return extractUsernameFromPattern(
        cleanedUrl,
        /youtube\.com\/(?:c\/|@)([^\/]+)/,
        true,
      )
    case 'reddit':
      return extractUsernameFromPattern(
        cleanedUrl,
        /reddit\.com\/r\/([^\/]+)/,
        true,
      )
    case 'telegram':
      return extractUsernameFromPattern(cleanedUrl, /t\.me\/([^\/]+)/, false)
    case 'discord':
      return extractUsernameFromPattern(
        cleanedUrl,
        /discord\.(?:gg|com\/channels|com)\/([^\/]+)/,
        true,
      )
    case 'farcaster': {
      const isWarpcastUser = cleanedUrl.includes('warpcast')
      const isWarpcastChannel = cleanedUrl.includes('channel') && isWarpcastUser
      if (isWarpcastChannel) {
        return extractUsernameFromPattern(
          cleanedUrl,
          /warpcast\.com\/~\/channel\/([^\/]+)/,
          true,
        )
      } else if (isWarpcastUser) {
        return extractUsernameFromPattern(
          cleanedUrl,
          /warpcast\.com\/([^\/]+)/,
          false,
        )
      } else {
        return extractUsernameFromPattern(
          cleanedUrl,
          /farcaster\.xyz\/([^\/]+)/,
          false,
        )
      }
    }
    case 'lens':
      return extractUsernameFromPattern(
        cleanedUrl,
        /lens\.xyz\/([^\/]+)/,
        false,
      )
    case 'website':
    default:
      return cleanedUrl
  }
}

export const extractUsernameFromPattern = (
  url: string,
  regex: RegExp,
  isChannel: boolean,
): string => {
  const match = url.match(regex)
  if (match && match[1]) {
    return isChannel ? `/${match[1]}` : `@${match[1]}`
  }
  return url
}

export function ensureHttps(url: string): string {
  if (!url.startsWith('https://')) {
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://')
    } else {
      url = 'https://' + url
    }
  }
  return url
}
