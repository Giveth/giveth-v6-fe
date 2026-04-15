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
        wallets {
          address
        }
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
        chainType
        memo
      }
      projectQfRounds {
        countUniqueDonors
        sumDonationValueUsd
        qfRound {
          id
          name
          slug
          isActive
          beginDate
          endDate
        }
      }
    }
  }
`)

export const projectByIDQuery = graphql(`
  query Project($id: Int!) {
    project(id: $id) {
      id
      title
      slug
      description
      image
      status
      addresses {
        address
        networkId
        chainType
        memo
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
      allocatedFundUSDPreferred
      allocatedFund
      allocatedTokenSymbol
      maximumReward
      isActive
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
      allocatedFundUSDPreferred
      allocatedFund
      allocatedTokenSymbol
      minimumValidUsdValue
      displaySize
      maximumReward
    }
  }
`)

export const qfRoundsQuery = graphql(`
  query QfRounds(
    $skip: Int = 0
    $take: Int = 50
    $filters: QfRoundsFiltersInput
  ) {
    qfRounds(skip: $skip, take: $take, filters: $filters) {
      total
      rounds {
        id
        name
        slug
        eligibleNetworks
        applicationTypeformUrl
      }
    }
  }
`)

export const projectAddressesBySlugQuery = graphql(`
  query ProjectAddressesBySlug($slug: String!) {
    projectAddressesBySlug(slug: $slug) {
      id
      title
      slug
      addresses {
        address
        networkId
        isRecipient
      }
    }
  }
`)

export const donationsByProjectQuery = graphql(`
  query DonationsByProject(
    $projectId: Int!
    $skip: Int
    $take: Int
    $orderBy: DonationSortField!
    $orderDirection: SortDirection!
    $qfRoundId: Int
  ) {
    donationsByProject(
      projectId: $projectId
      skip: $skip
      take: $take
      orderBy: $orderBy
      orderDirection: $orderDirection
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
        anonymous
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
        addresses {
          id
          address
          networkId
          chainType
          memo
        }
        adminUser {
          id
          name
          wallets {
            address
          }
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

export const createDonationMutation = graphql(`
  mutation CreateDonation($input: CreateDonationInput!) {
    createDonation(input: $input) {
      id
      status
      transactionId
      transactionNetworkId
      projectId
      qfRoundId
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
          chainType
          memo
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
        allocatedFundUSDPreferred
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

export const currentGivbacksRoundQuery = graphql(`
  query GetCurrentGivbacksRound {
    currentGivbacksRound {
      prizePool
      prizePoolCap
      ticketCount
      imageUrl
      roundNumber
      startsAt
      endsAt
    }
  }
`)

export const currentGivbacksRoundPublicQuery = graphql(`
  query GetCurrentGivbacksRoundPublic {
    currentGivbacksRound {
      prizePool
      prizePoolCap
      imageUrl
      roundNumber
      startsAt
      endsAt
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
      projectsWithDonationsCount
      totalDonated
      totalReceived
      uniqueProjectsDonatedTo
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
  query MyDonations(
    $skip: Int = 0
    $take: Int = 20
    $orderBy: DonationSortField! = CreatedAt
    $orderDirection: SortDirection! = DESC
  ) {
    myDonations(
      skip: $skip
      take: $take
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
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
        qfRoundName
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

export const refreshPassportEligibilityQuery = graphql(`
  mutation RefreshPassportScore($address: String!) {
    refreshPassportScore(input: { address: $address }) {
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

export const globalConfigurationsQuery = graphql(`
  query GlobalConfigurations($isActive: Boolean) {
    globalConfigurations(isActive: $isActive) {
      id
      key
      value
      description
      type
      isActive
      createdAt
      updatedAt
    }
  }
`)

export const globalConfigurationQuery = graphql(`
  query GlobalConfiguration($key: String!) {
    globalConfiguration(key: $key) {
      id
      key
      value
      description
      type
      isActive
      createdAt
      updatedAt
    }
  }
`)

export const userByAddressQuery = graphql(`
  query UserByAddress($address: String!) {
    userByAddress(address: $address) {
      id
      name
      firstName
      lastName
      avatar
      primaryEns
      totalDonated
      totalReceived
      wallets {
        address
        chainType
        isPrimary
      }
      createdAt
    }
  }
`)

export const donationsByUserQuery = graphql(`
  query DonationsByUser($userId: Int!, $skip: Int! = 0, $take: Int! = 20) {
    donationsByUser(userId: $userId, skip: $skip, take: $take) {
      total
      donations {
        id
        createdAt
        amount
        currency
        valueUsd
        status
        transactionId
        transactionNetworkId
        projectId
        qfRoundId
        qfRoundName
        project {
          id
          title
          slug
        }
      }
    }
  }
`)

export const getQfRoundHistoryQuery = graphql(`
  query GetQfRoundHistory($projectId: Int!, $qfRoundId: Int!) {
    getQfRoundHistory(projectId: $projectId, qfRoundId: $qfRoundId) {
      projectId
      qfRoundId
      uniqueDonors
      donationsCount
      raisedFundInUsd
      allocatedFundUSDPreferred

      # Estimated matching from QF calculation
      estimatedMatching {
        amountUsd # USD value from QF algorithm
        amount # Amount in native token
      }

      # Actual distributed matching (null until funds are distributed)
      distributedFund {
        amountUsd # USD value of distributed funds
        amount # Amount in native token
        currency # Token symbol (USDGLO, GIV, etc)
        txHash # Transaction hash for "View transaction" link
        networkId # Chain ID (100 = Gnosis, 1 = Mainnet, etc)
        txDate # Distribution timestamp
      }
    }
  }
`)

export const fetchUserBoostForProjectQuery = `
  query FetchUserBoostForProject($userId: Int!, $projectId: Int!) {
    getPowerBoosting(
      input: { userId: $userId, projectId: $projectId, skip: 0, take: 1 }
    ) {
      totalCount
      powerBoostings {
        projectId
        percentage
        updatedAt
      }
    }
  }
`

export const fetchPowerBoostingInfoV6Query = `
  query FetchPowerBoostingInfoV6($input: GetPowerBoostingInput!) {
    getPowerBoosting(input: $input) {
      totalCount
      powerBoostings {
        id
        userId
        projectId
        percentage
        updatedAt
        user {
          id
        }
        project {
          id
          title
          slug
          reviewStatus
          powerRank
        }
      }
    }
  }
`

export const fetchCurrentProjectBoostV6Query = `
  query FetchCurrentProjectBoostV6($input: GetPowerBoostingInput!) {
    getPowerBoosting(input: $input) {
      totalCount
      powerBoostings {
        projectId
        percentage
      }
    }
  }
`

export const projectGivpowerCountQuery = `
  query ProjectGivpowerCount($input: GetPowerBoostingInput!) {
    getPowerBoosting(input: $input) {
      totalCount
    }
  }
`

export const projectBoostersQuery = `
  query ProjectBoosters($input: GetPowerBoostingInput!) {
    getPowerBoosting(input: $input) {
      totalCount
      powerBoostings {
        id
        projectId
        userId
        percentage
        powerRank
        updatedAt
        user {
          id
          name
          firstName
          lastName
          avatar
          primaryEns
          wallets {
            address
            isPrimary
          }
        }
      }
    }
  }
`

export const setSinglePowerBoostingMutation = `
  mutation SetSinglePowerBoosting($projectId: Int!, $percentage: Float!) {
    setSinglePowerBoosting(projectId: $projectId, percentage: $percentage) {
      id
      userId
      projectId
      percentage
      powerRank
      updatedAt
    }
  }
`

export const setMultiplePowerBoostingMutation = `
  mutation SetMultiplePowerBoosting(
    $projectIds: [Int!]!
    $percentages: [Float!]!
  ) {
    setMultiplePowerBoosting(projectIds: $projectIds, percentages: $percentages) {
      id
      userId
      projectId
      percentage
      powerRank
      updatedAt
    }
  }
`
