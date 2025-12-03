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
    "\n  query QfRoundStats($qfRoundId: Int!) {\n    qfRoundStats(qfRoundId: $qfRoundId) {\n      totalDonationsUsd\n      donationsCount\n      uniqueDonors\n      qfRound {\n        id\n        allocatedFundUSD\n        allocatedTokenSymbol\n        beginDate\n        endDate\n      }\n    }\n  }\n": typeof types.QfRoundStatsDocument,
};
const documents: Documents = {
    "\n  query ActiveQfRounds {\n    activeQfRounds {\n      id\n      name\n      slug\n      isActive\n      beginDate\n      endDate\n      projectQfRounds {\n        sumDonationValueUsd\n        countUniqueDonors\n        project {\n          id\n          title\n          slug\n          image\n          descriptionSummary\n          adminUser {\n            name\n            firstName\n            lastName\n          }\n        }\n      }\n    }\n  }\n": types.ActiveQfRoundsDocument,
    "\n  query QfRoundStats($qfRoundId: Int!) {\n    qfRoundStats(qfRoundId: $qfRoundId) {\n      totalDonationsUsd\n      donationsCount\n      uniqueDonors\n      qfRound {\n        id\n        allocatedFundUSD\n        allocatedTokenSymbol\n        beginDate\n        endDate\n      }\n    }\n  }\n": types.QfRoundStatsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ActiveQfRounds {\n    activeQfRounds {\n      id\n      name\n      slug\n      isActive\n      beginDate\n      endDate\n      projectQfRounds {\n        sumDonationValueUsd\n        countUniqueDonors\n        project {\n          id\n          title\n          slug\n          image\n          descriptionSummary\n          adminUser {\n            name\n            firstName\n            lastName\n          }\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ActiveQfRoundsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query QfRoundStats($qfRoundId: Int!) {\n    qfRoundStats(qfRoundId: $qfRoundId) {\n      totalDonationsUsd\n      donationsCount\n      uniqueDonors\n      qfRound {\n        id\n        allocatedFundUSD\n        allocatedTokenSymbol\n        beginDate\n        endDate\n      }\n    }\n  }\n"): typeof import('./graphql').QfRoundStatsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
