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
