import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { graphql } from '@/lib/graphql/generated'

const activeQfRoundsQuery = graphql(`
  query ActiveQfRounds {
    activeQfRounds {
      id
      name
      slug
      isActive
      beginDate
      endDate
      projectQfRounds {
        sumDonationValueUsd
        countUniqueDonors
        project {
          id
          title
          slug
          image
          descriptionSummary
          adminUser {
            name
            firstName
            lastName
          }
        }
      }
    }
  }
`)

export const useActiveQfRounds = () => {
  return useQuery({
    queryKey: ['activeQfRounds'],
    queryFn: async () => {
      return graphQLClient.request(activeQfRoundsQuery)
    },
  })
}
