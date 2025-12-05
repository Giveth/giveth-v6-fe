import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { graphql } from '@/lib/graphql/generated'

const projectBySlugQuery = graphql(`
  query ProjectBySlug($slug: String!) {
    projectBySlug(slug: $slug) {
      id
      title
      slug
      description
      descriptionSummary
      image
      impactLocation
      totalDonations
      countUniqueDonors
      adminUser {
        name
        firstName
        lastName
        avatar
      }
      addresses {
        address
        chainType
        networkId
        title
      }
      categories {
        name
      }
      givbacksEligibilityStatus
      vouched
    }
  }
`)

const donationsByProjectQuery = graphql(`
  query DonationsByProject($projectId: Int!, $skip: Int, $take: Int) {
    donationsByProject(projectId: $projectId, skip: $skip, take: $take) {
      donations {
        id
        amount
        currency
        valueUsd
        createdAt
        transactionNetworkId
        fromWalletAddress
        user {
          name
          firstName
          lastName
          avatar
        }
      }
      total
    }
  }
`)

const projectsQuery = graphql(`
  query Projects($take: Int, $skip: Int) {
    projects(take: $take, skip: $skip) {
      projects {
        id
        title
        slug
        image
        totalDonations
        adminUser {
          name
          firstName
          lastName
        }
      }
    }
  }
`)

export const useProjectBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['projectBySlug', slug],
    queryFn: async () => {
      return graphQLClient.request(projectBySlugQuery, { slug })
    },
    enabled: !!slug,
  })
}

export const useProjectDonations = (
  projectId: number,
  skip: number = 0,
  take: number = 10,
) => {
  return useQuery({
    queryKey: ['donationsByProject', projectId, skip, take],
    queryFn: async () => {
      return graphQLClient.request(donationsByProjectQuery, {
        projectId,
        skip,
        take,
      })
    },
    enabled: !!projectId,
  })
}

export const useProjects = (skip: number = 0, take: number = 3) => {
  return useQuery({
    queryKey: ['projects', skip, take],
    queryFn: async () => {
      return graphQLClient.request(projectsQuery, { skip, take })
    },
  })
}
