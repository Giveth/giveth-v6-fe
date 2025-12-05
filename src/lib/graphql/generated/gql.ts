/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query ActiveQfRounds {\n    activeQfRounds {\n      id\n      name\n      slug\n      isActive\n      beginDate\n      endDate\n      projectQfRounds {\n        sumDonationValueUsd\n        countUniqueDonors\n        project {\n          id\n          title\n          slug\n          image\n          descriptionSummary\n          adminUser {\n            name\n            firstName\n            lastName\n          }\n        }\n      }\n    }\n  }\n": typeof types.ActiveQfRoundsDocument,
    "\n  query ProjectBySlug($slug: String!) {\n    projectBySlug(slug: $slug) {\n      id\n      title\n      slug\n      description\n      descriptionSummary\n      image\n      impactLocation\n      totalDonations\n      countUniqueDonors\n      adminUser {\n        name\n        firstName\n        lastName\n        avatar\n      }\n      addresses {\n        address\n        chainType\n        networkId\n        title\n      }\n      categories {\n        name\n      }\n      givbacksEligibilityStatus\n      vouched\n    }\n  }\n": typeof types.ProjectBySlugDocument,
    "\n  query DonationsByProject($projectId: Int!, $skip: Int, $take: Int) {\n    donationsByProject(projectId: $projectId, skip: $skip, take: $take) {\n      donations {\n        id\n        amount\n        currency\n        valueUsd\n        createdAt\n        transactionNetworkId\n        fromWalletAddress\n        user {\n          name\n          firstName\n          lastName\n          avatar\n        }\n      }\n      total\n    }\n  }\n": typeof types.DonationsByProjectDocument,
    "\n  query Projects($take: Int, $skip: Int) {\n    projects(take: $take, skip: $skip) {\n      projects {\n        id\n        title\n        slug\n        image\n        totalDonations\n        adminUser {\n          name\n          firstName\n          lastName\n        }\n      }\n    }\n  }\n": typeof types.ProjectsDocument,
    "\n  query QfRoundStats($qfRoundId: Int!) {\n    qfRoundStats(qfRoundId: $qfRoundId) {\n      totalDonationsUsd\n      donationsCount\n      uniqueDonors\n      qfRound {\n        id\n        allocatedFundUSD\n        allocatedTokenSymbol\n        beginDate\n        endDate\n      }\n    }\n  }\n": typeof types.QfRoundStatsDocument,
    "\n  query SearchProjects(\n    $searchTerm: String!\n    $skip: Int\n    $take: Int\n    $sortBy: String\n    $sortDirection: String\n  ) {\n    searchProjects(\n      searchTerm: $searchTerm\n      skip: $skip\n      take: $take\n      sortBy: $sortBy\n      sortDirection: $sortDirection\n    ) {\n      projects {\n        id\n        title\n        slug\n        description\n        descriptionSummary\n        image\n        vouched\n        totalDonations\n        totalReactions\n        countUniqueDonors\n        qualityScore\n        searchRank\n        createdAt\n        updatedAt\n      }\n      total\n    }\n  }\n": typeof types.SearchProjectsDocument,
};
const documents: Documents = {
    "\n  query ActiveQfRounds {\n    activeQfRounds {\n      id\n      name\n      slug\n      isActive\n      beginDate\n      endDate\n      projectQfRounds {\n        sumDonationValueUsd\n        countUniqueDonors\n        project {\n          id\n          title\n          slug\n          image\n          descriptionSummary\n          adminUser {\n            name\n            firstName\n            lastName\n          }\n        }\n      }\n    }\n  }\n": types.ActiveQfRoundsDocument,
    "\n  query ProjectBySlug($slug: String!) {\n    projectBySlug(slug: $slug) {\n      id\n      title\n      slug\n      description\n      descriptionSummary\n      image\n      impactLocation\n      totalDonations\n      countUniqueDonors\n      adminUser {\n        name\n        firstName\n        lastName\n        avatar\n      }\n      addresses {\n        address\n        chainType\n        networkId\n        title\n      }\n      categories {\n        name\n      }\n      givbacksEligibilityStatus\n      vouched\n    }\n  }\n": types.ProjectBySlugDocument,
    "\n  query DonationsByProject($projectId: Int!, $skip: Int, $take: Int) {\n    donationsByProject(projectId: $projectId, skip: $skip, take: $take) {\n      donations {\n        id\n        amount\n        currency\n        valueUsd\n        createdAt\n        transactionNetworkId\n        fromWalletAddress\n        user {\n          name\n          firstName\n          lastName\n          avatar\n        }\n      }\n      total\n    }\n  }\n": types.DonationsByProjectDocument,
    "\n  query Projects($take: Int, $skip: Int) {\n    projects(take: $take, skip: $skip) {\n      projects {\n        id\n        title\n        slug\n        image\n        totalDonations\n        adminUser {\n          name\n          firstName\n          lastName\n        }\n      }\n    }\n  }\n": types.ProjectsDocument,
    "\n  query QfRoundStats($qfRoundId: Int!) {\n    qfRoundStats(qfRoundId: $qfRoundId) {\n      totalDonationsUsd\n      donationsCount\n      uniqueDonors\n      qfRound {\n        id\n        allocatedFundUSD\n        allocatedTokenSymbol\n        beginDate\n        endDate\n      }\n    }\n  }\n": types.QfRoundStatsDocument,
    "\n  query SearchProjects(\n    $searchTerm: String!\n    $skip: Int\n    $take: Int\n    $sortBy: String\n    $sortDirection: String\n  ) {\n    searchProjects(\n      searchTerm: $searchTerm\n      skip: $skip\n      take: $take\n      sortBy: $sortBy\n      sortDirection: $sortDirection\n    ) {\n      projects {\n        id\n        title\n        slug\n        description\n        descriptionSummary\n        image\n        vouched\n        totalDonations\n        totalReactions\n        countUniqueDonors\n        qualityScore\n        searchRank\n        createdAt\n        updatedAt\n      }\n      total\n    }\n  }\n": types.SearchProjectsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ActiveQfRounds {\n    activeQfRounds {\n      id\n      name\n      slug\n      isActive\n      beginDate\n      endDate\n      projectQfRounds {\n        sumDonationValueUsd\n        countUniqueDonors\n        project {\n          id\n          title\n          slug\n          image\n          descriptionSummary\n          adminUser {\n            name\n            firstName\n            lastName\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ActiveQfRoundsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProjectBySlug($slug: String!) {\n    projectBySlug(slug: $slug) {\n      id\n      title\n      slug\n      description\n      descriptionSummary\n      image\n      impactLocation\n      totalDonations\n      countUniqueDonors\n      adminUser {\n        name\n        firstName\n        lastName\n        avatar\n      }\n      addresses {\n        address\n        chainType\n        networkId\n        title\n      }\n      categories {\n        name\n      }\n      givbacksEligibilityStatus\n      vouched\n    }\n  }\n"): typeof import('./graphql').ProjectBySlugDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DonationsByProject($projectId: Int!, $skip: Int, $take: Int) {\n    donationsByProject(projectId: $projectId, skip: $skip, take: $take) {\n      donations {\n        id\n        amount\n        currency\n        valueUsd\n        createdAt\n        transactionNetworkId\n        fromWalletAddress\n        user {\n          name\n          firstName\n          lastName\n          avatar\n        }\n      }\n      total\n    }\n  }\n"): typeof import('./graphql').DonationsByProjectDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Projects($take: Int, $skip: Int) {\n    projects(take: $take, skip: $skip) {\n      projects {\n        id\n        title\n        slug\n        image\n        totalDonations\n        adminUser {\n          name\n          firstName\n          lastName\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ProjectsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query QfRoundStats($qfRoundId: Int!) {\n    qfRoundStats(qfRoundId: $qfRoundId) {\n      totalDonationsUsd\n      donationsCount\n      uniqueDonors\n      qfRound {\n        id\n        allocatedFundUSD\n        allocatedTokenSymbol\n        beginDate\n        endDate\n      }\n    }\n  }\n"): typeof import('./graphql').QfRoundStatsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SearchProjects(\n    $searchTerm: String!\n    $skip: Int\n    $take: Int\n    $sortBy: String\n    $sortDirection: String\n  ) {\n    searchProjects(\n      searchTerm: $searchTerm\n      skip: $skip\n      take: $take\n      sortBy: $sortBy\n      sortDirection: $sortDirection\n    ) {\n      projects {\n        id\n        title\n        slug\n        description\n        descriptionSummary\n        image\n        vouched\n        totalDonations\n        totalReactions\n        countUniqueDonors\n        qualityScore\n        searchRank\n        createdAt\n        updatedAt\n      }\n      total\n    }\n  }\n"): typeof import('./graphql').SearchProjectsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

