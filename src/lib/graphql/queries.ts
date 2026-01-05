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
      descriptionSummary
      image
      impactLocation
      createdAt
      updatedAt
      totalDonations
      countUniqueDonors
      vouched
      isGivbacksEligible
      socialMedia {
        id
        type
        link
      }
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
      projectQfRounds {
        id
        qfRoundId
        qfRound {
          id
          name
          slug
          isActive
        }
        project {
          id
          qfRoundMatchingProjects {
            qfRoundMatchingId
            matchingAmount
          }
        }
      }
    }
  }
`)

export const qfRoundBySlugQuery = graphql(`
  query QfRoundBySlug($slug: String!) {
    qfRoundBySlug(slug: $slug) {
      id
      name
      title
      description
      slug
      bannerFull
      bannerBgImage
      bannerMobile
      sponsorsImgs
      beginDate
      endDate
      allocatedFundUSD
    }
  }
`)

export const activeQfRoundsQuery = graphql(`
  query ActiveQfRounds {
    activeQfRounds {
      id
      name
      description
      slug
      isActive
      beginDate
      endDate
      eligibleNetworks
      hubCardImage
      allocatedFundUSD
      allocatedFund
      allocatedTokenSymbol
      minimumValidUsdValue
    }
  }
`)

export const donationsByProjectQuery = graphql(`
  query DonationsByProject(
    $projectId: Int!
    $skip: Int
    $take: Int
    $qfRoundId: Int
  ) {
    donationsByProject(
      projectId: $projectId
      skip: $skip
      take: $take
      qfRoundId: $qfRoundId
    ) {
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
        reviewStatus
        descriptionSummary
        totalDonations
        countUniqueDonors
        vouched
        isGivbacksEligible
        adminUser {
          id
          name
        }
        projectQfRounds {
          id
          qfRoundId
          sumDonationValueUsd
          countUniqueDonors
        }
      }
      total
    }
  }
`)

export const similarProjectsBySlugQuery = graphql(`
  query SimilarProjectsBySlug($slug: String!, $skip: Int = 0, $take: Int = 10) {
    similarProjectsBySlug(slug: $slug, skip: $skip, take: $take) {
      projects {
        id
        title
        slug
        image
        descriptionSummary
        totalDonations
        countUniqueDonors
        qualityScore
        searchRank
        vouched
        isGivbacksEligible
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

export const archivedQfRoundsQuery = graphql(`
  query ArchivedQfRounds($skip: Int = 0, $take: Int = 20) {
    archivedQfRounds(skip: $skip, take: $take) {
      rounds {
        id
        name
        description
        allocatedFundUSD
        allocatedFund
        allocatedTokenSymbol
        slug
        isActive
        beginDate
        endDate
        hubCardImage
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

export const userProfileQuery = graphql(`
  query UserProfile {
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
      location
      twitterName
      telegramName
      isEmailVerified
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

export const myProjectsQuery = graphql(`
  query MyProjects(
    $skip: Int = 0
    $take: Int = 10
    $orderBy: ProjectSortField = CreatedAt
    $orderDirection: SortDirection = DESC
  ) {
    myProjects(
      skip: $skip
      take: $take
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      total
      projects {
        id
        title
        slug
        createdAt
        reviewStatus
        isGivbacksEligible
        vouched
        totalDonations
      }
    }
  }
`)

export const myDonationsQuery = graphql(`
  query MyDonations($skip: Int = 0, $take: Int = 20) {
    myDonations(skip: $skip, take: $take) {
      total
      donations {
        id
        amount
        valueUsd
        currency
        status
        transactionId
        transactionNetworkId
        createdAt
        project {
          id
          title
          slug
        }
      }
    }
  }
`)

export const projectUpdatesQuery = graphql(`
  query ProjectUpdates($input: ProjectUpdateQueryInput!) {
    projectUpdates(input: $input) {
      totalCount
      projectUpdates {
        id
        title
        projectId
        content
        contentSummary
        createdAt
        isMain
        totalReactions
      }
    }
  }
`)

export const profileQuery = graphql(`
  query MeProfile {
    me {
      id
      email
      firstName
      lastName
      name
      avatar
      url
      location
      twitterName
      telegramName
      isEmailVerified
      wallets {
        id
        address
        isPrimary
        chainType
      }
    }
  }
`)

export const tokensQuery = graphql(`
  query Tokens {
    tokens {
      id
      name
      symbol
      address
      decimals
      networkId
      chainType
      isActive
      coingeckoId
    }
  }
`)

export const tokensByNetworkQuery = graphql(`
  query TokensByNetwork($networkId: Int!) {
    tokensByNetwork(networkId: $networkId) {
      id
      name
      symbol
      address
      decimals
      networkId
      chainType
      isActive
      coingeckoId
      isGivbacksEligible
    }
  }
`)

export const estimatedMatchingQuery = graphql(`
  query EstimatedMatching(
    $donationAmount: Float!
    $donorAddress: String!
    $projectId: Int!
    $qfRoundId: Int!
  ) {
    estimatedMatching(
      donationAmount: $donationAmount
      donorAddress: $donorAddress
      projectId: $projectId
      qfRoundId: $qfRoundId
    ) {
      projectId
      qfRoundId
      matchingPool
      allProjectsSqrtSum
      projectDonationsSqrtSum
      estimatedMatching
    }
  }
`)

export const checkPassportEligibilityQuery = graphql(`
  query CheckPassportEligibility($input: CheckPassportEligibilityInput!) {
    checkPassportEligibility(input: $input) {
      isEligible
      passportScore
      mbdScore
      threshold
      expirationDate
      message
      eligibility {
        id
        address
        score
        mbdScore
        lastScoreTimestamp
        expirationTimestamp
        stamps
        error
        createdAt
        updatedAt
      }
    }
  }
`)
