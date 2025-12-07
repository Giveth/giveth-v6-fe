import { graphql } from './generated/gql'

export const categoriesQuery = graphql(`
  query Categories {
    categories {
      id
      name
      value
      isActive
      canUseOnFrontend
      mainCategory {
        id
        title
        slug
      }
    }
  }
`)

export const mainCategoriesQuery = graphql(`
  query MainCategories {
    mainCategories {
      id
      title
      slug
      description
      banner
      categories {
        id
        name
        value
        isActive
        canUseOnFrontend
      }
    }
  }
`)

export const projectBySlugQuery = graphql(`
  query ProjectBySlug($slug: String!) {
    projectBySlug(slug: $slug) {
      id
      title
      slug
      description
      image
      descriptionSummary
      impactLocation
      createdAt
      updatedAt
      totalDonations
      countUniqueDonors
      vouched
      givbacksEligibilityStatus
      adminUser {
        id
        name
        firstName
        lastName
        avatar
      }
      categories {
        id
        name
        value
        mainCategory {
          id
          title
          slug
        }
      }
      addresses {
        id
        address
        networkId
        title
        chainType
      }
    }
  }
`)

export const donationsByProjectQuery = graphql(`
  query DonationsByProject($projectId: Int!, $skip: Int, $take: Int) {
    donationsByProject(projectId: $projectId, skip: $skip, take: $take) {
      donations {
        id
        amount
        valueUsd
        currency
        transactionId
        transactionNetworkId
        fromWalletAddress
        createdAt
        user {
          id
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

export const projectsQuery = graphql(`
  query Projects(
    $skip: Int = 0
    $take: Int = 20
    $orderBy: ProjectSortField = CreatedAt
    $orderDirection: SortDirection = DESC
    $filters: ProjectFiltersInput
  ) {
    projects(
      skip: $skip
      take: $take
      orderBy: $orderBy
      orderDirection: $orderDirection
      filters: $filters
    ) {
      projects {
        id
        title
        slug
        image
        descriptionSummary
        totalDonations
        countUniqueDonors
        qualityScore
        vouched
        givbacksEligibilityStatus
        searchRank
        adminUser {
          id
          name
          firstName
          lastName
          avatar
        }
        categories {
          id
          name
          value
          mainCategory {
            id
            title
            slug
          }
        }
        addresses {
          id
          address
          networkId
          title
          chainType
        }
      }
      total
    }
  }
`)

export const qfRoundStatsQuery = graphql(`
  query QfRoundStats($qfRoundId: Int!) {
    qfRoundStats(qfRoundId: $qfRoundId) {
      totalDonationsUsd
      donationsCount
      uniqueDonors
      qfRound {
        id
        name
        slug
      }
    }
  }
`)

export const meQuery = graphql(`
  query Me {
    me {
      id
      email
      name
      firstName
      lastName
      avatar
      primaryEns
      url
      totalDonated
      totalReceived
      wallets {
        id
        address
        isPrimary
        chainType
      }
    }
  }
`)

export const userStatsQuery = graphql(`
  query UserStats($id: Int!) {
    userStats(id: $id) {
      id
      email
      name
      firstName
      lastName
      avatar
      primaryEns
      url
      totalDonated
      totalReceived
      donationsCount
      projectsCount
      likedProjectsCount
      wallets {
        id
        address
        isPrimary
        chainType
      }
    }
  }
`)
