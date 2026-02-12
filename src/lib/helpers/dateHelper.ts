let initialized = false
let timeDifference = 0
let fetching = false

export const getNowUnixMS = (): number => {
  if (!initialized && !fetching && typeof window !== 'undefined') {
    fetchServerTime()
  }
  return Date.now() + timeDifference
}

const fetchServerTime = async () => {
  const stored = window.sessionStorage.getItem('timeDifference')
  if (stored) {
    timeDifference = Number(stored)
    initialized = true
    return
  }

  const startTime = Date.now()

  try {
    fetching = true
    const response = await fetch(`/api/time`, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    })

    if (response.ok) {
      const json = await response.json()
      const { unixTime } = json
      timeDifference = Math.floor(
        (unixTime - startTime + unixTime - Date.now()) / 2,
      )
      initialized = true
      window.sessionStorage.setItem('timeDifference', String(timeDifference))
    }
  } catch (e) {
    console.error('Error in getting time:', e)
  } finally {
    fetching = false
  }
}

/**
 * Helper function to get the date range
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns The date range
 */
export const getDateRange = (startDate: string, endDate: string) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ]
  const startDateObj = new Date(startDate)
  const endDateObj = new Date(endDate)
  const startMonth = months[startDateObj.getMonth()]
  const endMonth = months[endDateObj.getMonth()]
  const startYear = startDateObj.getFullYear()
  const endYear = endDateObj.getFullYear()
  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startMonth} ${startDateObj.getDate()} - ${endDateObj.getDate()}, ${startYear}`
    }
    return `${startMonth} ${startDateObj.getDate()} - ${endMonth} ${endDateObj.getDate()}, ${startYear}`
  }
  return `${startMonth} ${startDateObj.getDate()}, ${startYear} - ${endMonth} ${endDateObj.getDate()}, ${endYear}`
}
