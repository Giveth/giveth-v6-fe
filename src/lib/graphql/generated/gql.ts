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
    "\n  query Categories {\n    categories {\n      id\n      name\n      value\n      isActive\n      canUseOnFrontend\n      mainCategory {\n        id\n        title\n        slug\n      }\n    }\n  }\n": typeof types.CategoriesDocument,
    "\n  query MainCategories {\n    mainCategories {\n      id\n      title\n      slug\n      description\n      banner\n      categories {\n        id\n        name\n        value\n        isActive\n        canUseOnFrontend\n      }\n    }\n  }\n": typeof types.MainCategoriesDocument,
    "\n  query ProjectBySlug($slug: String!) {\n    projectBySlug(slug: $slug) {\n      id\n      title\n      slug\n      description\n      image\n      descriptionSummary\n      impactLocation\n      createdAt\n      updatedAt\n      totalDonations\n      countUniqueDonors\n      vouched\n      givbacksEligibilityStatus\n      adminUser {\n        id\n        name\n        firstName\n        lastName\n        avatar\n      }\n      categories {\n        id\n        name\n        value\n        mainCategory {\n          id\n          title\n          slug\n        }\n      }\n      addresses {\n        id\n        address\n        networkId\n        title\n        chainType\n      }\n    }\n  }\n": typeof types.ProjectBySlugDocument,
    "\n  query DonationsByProject($projectId: Int!, $skip: Int, $take: Int) {\n    donationsByProject(projectId: $projectId, skip: $skip, take: $take) {\n      donations {\n        id\n        amount\n        valueUsd\n        currency\n        transactionId\n        transactionNetworkId\n        fromWalletAddress\n        createdAt\n        user {\n          id\n          name\n          firstName\n          lastName\n          avatar\n        }\n      }\n      total\n    }\n  }\n": typeof types.DonationsByProjectDocument,
    "\n  query Projects(\n    $skip: Int = 0\n    $take: Int = 20\n    $orderBy: ProjectSortField = CreatedAt\n    $orderDirection: SortDirection = DESC\n    $filters: ProjectFiltersInput\n  ) {\n    projects(\n      skip: $skip\n      take: $take\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      filters: $filters\n    ) {\n      projects {\n        id\n        title\n        slug\n        image\n        descriptionSummary\n        totalDonations\n        countUniqueDonors\n        qualityScore\n        vouched\n        givbacksEligibilityStatus\n        searchRank\n        adminUser {\n          id\n          name\n          firstName\n          lastName\n          avatar\n        }\n        categories {\n          id\n          name\n          value\n          mainCategory {\n            id\n            title\n            slug\n          }\n        }\n        addresses {\n          id\n          address\n          networkId\n          title\n          chainType\n        }\n      }\n      total\n    }\n  }\n": typeof types.ProjectsDocument,
    "\n  query QfRoundStats($qfRoundId: Int!) {\n    qfRoundStats(qfRoundId: $qfRoundId) {\n      totalDonationsUsd\n      donationsCount\n      uniqueDonors\n      qfRound {\n        id\n        name\n        slug\n      }\n    }\n  }\n": typeof types.QfRoundStatsDocument,
};
const documents: Documents = {
    "\n  query ActiveQfRounds {\n    activeQfRounds {\n      id\n      name\n      slug\n      isActive\n      beginDate\n      endDate\n      projectQfRounds {\n        sumDonationValueUsd\n        countUniqueDonors\n        project {\n          id\n          title\n          slug\n          image\n          descriptionSummary\n          adminUser {\n            name\n            firstName\n            lastName\n          }\n        }\n      }\n    }\n  }\n": types.ActiveQfRoundsDocument,
    "\n  query Categories {\n    categories {\n      id\n      name\n      value\n      isActive\n      canUseOnFrontend\n      mainCategory {\n        id\n        title\n        slug\n      }\n    }\n  }\n": types.CategoriesDocument,
    "\n  query MainCategories {\n    mainCategories {\n      id\n      title\n      slug\n      description\n      banner\n      categories {\n        id\n        name\n        value\n        isActive\n        canUseOnFrontend\n      }\n    }\n  }\n": types.MainCategoriesDocument,
    "\n  query ProjectBySlug($slug: String!) {\n    projectBySlug(slug: $slug) {\n      id\n      title\n      slug\n      description\n      image\n      descriptionSummary\n      impactLocation\n      createdAt\n      updatedAt\n      totalDonations\n      countUniqueDonors\n      vouched\n      givbacksEligibilityStatus\n      adminUser {\n        id\n        name\n        firstName\n        lastName\n        avatar\n      }\n      categories {\n        id\n        name\n        value\n        mainCategory {\n          id\n          title\n          slug\n        }\n      }\n      addresses {\n        id\n        address\n        networkId\n        title\n        chainType\n      }\n    }\n  }\n": types.ProjectBySlugDocument,
    "\n  query DonationsByProject($projectId: Int!, $skip: Int, $take: Int) {\n    donationsByProject(projectId: $projectId, skip: $skip, take: $take) {\n      donations {\n        id\n        amount\n        valueUsd\n        currency\n        transactionId\n        transactionNetworkId\n        fromWalletAddress\n        createdAt\n        user {\n          id\n          name\n          firstName\n          lastName\n          avatar\n        }\n      }\n      total\n    }\n  }\n": types.DonationsByProjectDocument,
    "\n  query Projects(\n    $skip: Int = 0\n    $take: Int = 20\n    $orderBy: ProjectSortField = CreatedAt\n    $orderDirection: SortDirection = DESC\n    $filters: ProjectFiltersInput\n  ) {\n    projects(\n      skip: $skip\n      take: $take\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      filters: $filters\n    ) {\n      projects {\n        id\n        title\n        slug\n        image\n        descriptionSummary\n        totalDonations\n        countUniqueDonors\n        qualityScore\n        vouched\n        givbacksEligibilityStatus\n        searchRank\n        adminUser {\n          id\n          name\n          firstName\n          lastName\n          avatar\n        }\n        categories {\n          id\n          name\n          value\n          mainCategory {\n            id\n            title\n            slug\n          }\n        }\n        addresses {\n          id\n          address\n          networkId\n          title\n          chainType\n        }\n      }\n      total\n    }\n  }\n": types.ProjectsDocument,
    "\n  query QfRoundStats($qfRoundId: Int!) {\n    qfRoundStats(qfRoundId: $qfRoundId) {\n      totalDonationsUsd\n      donationsCount\n      uniqueDonors\n      qfRound {\n        id\n        name\n        slug\n      }\n    }\n  }\n": types.QfRoundStatsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ActiveQfRounds {\n    activeQfRounds {\n      id\n      name\n      slug\n      isActive\n      beginDate\n      endDate\n      projectQfRounds {\n        sumDonationValueUsd\n        countUniqueDonors\n        project {\n          id\n          title\n          slug\n          image\n          descriptionSummary\n          adminUser {\n            name\n            firstName\n            lastName\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ActiveQfRoundsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Categories {\n    categories {\n      id\n      name\n      value\n      isActive\n      canUseOnFrontend\n      mainCategory {\n        id\n        title\n        slug\n      }\n    }\n  }\n"): typeof import('./graphql').CategoriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MainCategories {\n    mainCategories {\n      id\n      title\n      slug\n      description\n      banner\n      categories {\n        id\n        name\n        value\n        isActive\n        canUseOnFrontend\n      }\n    }\n  }\n"): typeof import('./graphql').MainCategoriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ProjectBySlug($slug: String!) {\n    projectBySlug(slug: $slug) {\n      id\n      title\n      slug\n      description\n      image\n      descriptionSummary\n      impactLocation\n      createdAt\n      updatedAt\n      totalDonations\n      countUniqueDonors\n      vouched\n      givbacksEligibilityStatus\n      adminUser {\n        id\n        name\n        firstName\n        lastName\n        avatar\n      }\n      categories {\n        id\n        name\n        value\n        mainCategory {\n          id\n          title\n          slug\n        }\n      }\n      addresses {\n        id\n        address\n        networkId\n        title\n        chainType\n      }\n    }\n  }\n"): typeof import('./graphql').ProjectBySlugDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DonationsByProject($projectId: Int!, $skip: Int, $take: Int) {\n    donationsByProject(projectId: $projectId, skip: $skip, take: $take) {\n      donations {\n        id\n        amount\n        valueUsd\n        currency\n        transactionId\n        transactionNetworkId\n        fromWalletAddress\n        createdAt\n        user {\n          id\n          name\n          firstName\n          lastName\n          avatar\n        }\n      }\n      total\n    }\n  }\n"): typeof import('./graphql').DonationsByProjectDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Projects(\n    $skip: Int = 0\n    $take: Int = 20\n    $orderBy: ProjectSortField = CreatedAt\n    $orderDirection: SortDirection = DESC\n    $filters: ProjectFiltersInput\n  ) {\n    projects(\n      skip: $skip\n      take: $take\n      orderBy: $orderBy\n      orderDirection: $orderDirection\n      filters: $filters\n    ) {\n      projects {\n        id\n        title\n        slug\n        image\n        descriptionSummary\n        totalDonations\n        countUniqueDonors\n        qualityScore\n        vouched\n        givbacksEligibilityStatus\n        searchRank\n        adminUser {\n          id\n          name\n          firstName\n          lastName\n          avatar\n        }\n        categories {\n          id\n          name\n          value\n          mainCategory {\n            id\n            title\n            slug\n          }\n        }\n        addresses {\n          id\n          address\n          networkId\n          title\n          chainType\n        }\n      }\n      total\n    }\n  }\n"): typeof import('./graphql').ProjectsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query QfRoundStats($qfRoundId: Int!) {\n    qfRoundStats(qfRoundId: $qfRoundId) {\n      totalDonationsUsd\n      donationsCount\n      uniqueDonors\n      qfRound {\n        id\n        name\n        slug\n      }\n    }\n  }\n"): typeof import('./graphql').QfRoundStatsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
