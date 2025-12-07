/* eslint-disable */
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type AddWalletInput = {
  address: Scalars['String']['input'];
};

export type AuthUser = {
  __typename?: 'AuthUser';
  avatar?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  primaryWallet?: Maybe<Scalars['String']['output']>;
};

export type CategoryEntity = {
  __typename?: 'CategoryEntity';
  canUseOnFrontend: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  mainCategory?: Maybe<MainCategoryEntity>;
  mainCategoryId?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export enum ChainType {
  Evm = 'EVM',
  Solana = 'SOLANA'
}

export type CreateDonationInput = {
  amount: Scalars['Float']['input'];
  anonymous?: InputMaybe<Scalars['Boolean']['input']>;
  chainType?: InputMaybe<Scalars['String']['input']>;
  currency: Scalars['String']['input'];
  fromWalletAddress: Scalars['String']['input'];
  nonce?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  qfRoundId?: InputMaybe<Scalars['Int']['input']>;
  toWalletAddress: Scalars['String']['input'];
  tokenAddress?: InputMaybe<Scalars['String']['input']>;
  transactionId: Scalars['String']['input'];
  transactionNetworkId: Scalars['Int']['input'];
};

export type CreateProjectInput = {
  addresses?: InputMaybe<Array<ProjectAddressInput>>;
  categoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  description: Scalars['String']['input'];
  image?: InputMaybe<Scalars['String']['input']>;
  impactLocation?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateQfRoundInput = {
  allocatedFund: Scalars['Float']['input'];
  allocatedFundUSD?: InputMaybe<Scalars['Float']['input']>;
  allocatedTokenChainId?: InputMaybe<Scalars['Int']['input']>;
  allocatedTokenSymbol?: InputMaybe<Scalars['String']['input']>;
  bannerBgImage?: InputMaybe<Scalars['String']['input']>;
  bannerFull?: InputMaybe<Scalars['String']['input']>;
  bannerMobile?: InputMaybe<Scalars['String']['input']>;
  beginDate: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  eligibleNetworks?: InputMaybe<Array<Scalars['Int']['input']>>;
  endDate: Scalars['String']['input'];
  hubCardImage?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maximumReward?: InputMaybe<Scalars['Float']['input']>;
  minMBDScore?: InputMaybe<Scalars['Float']['input']>;
  minimumPassportScore: Scalars['Float']['input'];
  minimumValidUsdValue?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  qfStrategy?: InputMaybe<Scalars['String']['input']>;
  sponsorsImgs?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  walletAddress: Scalars['String']['input'];
};

export type DonationEntity = {
  __typename?: 'DonationEntity';
  amount: Scalars['Float']['output'];
  anonymous?: Maybe<Scalars['Boolean']['output']>;
  chainType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  fromWalletAddress: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  nonce?: Maybe<Scalars['Float']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
  project?: Maybe<ProjectEntity>;
  status: Scalars['String']['output'];
  toWalletAddress: Scalars['String']['output'];
  tokenAddress?: Maybe<Scalars['String']['output']>;
  transactionId: Scalars['String']['output'];
  transactionNetworkId: Scalars['Int']['output'];
  user?: Maybe<UserEntity>;
  valueUsd?: Maybe<Scalars['Float']['output']>;
  verifyErrorMessage?: Maybe<Scalars['String']['output']>;
};

export type DonationStatsEntity = {
  __typename?: 'DonationStatsEntity';
  donationsCount: Scalars['Int']['output'];
  totalAmount: Scalars['Float']['output'];
  totalUsd: Scalars['Float']['output'];
  uniqueDonors: Scalars['Int']['output'];
};

export type EstimatedMatchingEntity = {
  __typename?: 'EstimatedMatchingEntity';
  allProjectsSqrtSum: Scalars['Float']['output'];
  estimatedMatching: Scalars['Float']['output'];
  matchingPool: Scalars['Float']['output'];
  projectDonationsSqrtSum: Scalars['Float']['output'];
  projectId: Scalars['Int']['output'];
  qfRoundId: Scalars['Int']['output'];
};

export enum GivbacksEligibilityStatusType {
  Drafted = 'DRAFTED',
  Rejected = 'REJECTED',
  Submitted = 'SUBMITTED',
  Verified = 'VERIFIED'
}

export type MainCategoryEntity = {
  __typename?: 'MainCategoryEntity';
  banner?: Maybe<Scalars['String']['output']>;
  categories?: Maybe<Array<CategoryEntity>>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addProjectAddress: ProjectEntity;
  addProjectToQfRound: Scalars['Boolean']['output'];
  addWallet: UserEntity;
  calculateQfRoundMatching: QfRoundMatchingEntity;
  createDonation: DonationEntity;
  createProject: ProjectEntity;
  createQfRound: QfRoundEntity;
  createUser: UserEntity;
  removeProjectFromQfRound: Scalars['Boolean']['output'];
  removeWallet: UserEntity;
  setPrimaryWallet: UserEntity;
  updateProject: ProjectEntity;
  updateQfRound: QfRoundEntity;
  updateUser: UserEntity;
  verifyDonation: DonationEntity;
  verifySiweToken: SiweAuthResponse;
};


export type MutationAddProjectAddressArgs = {
  address: Scalars['String']['input'];
  chainType?: InputMaybe<ChainType>;
  networkId: Scalars['Int']['input'];
  projectId: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddProjectToQfRoundArgs = {
  projectId: Scalars['Int']['input'];
  qfRoundId: Scalars['Int']['input'];
};


export type MutationAddWalletArgs = {
  input: AddWalletInput;
};


export type MutationCalculateQfRoundMatchingArgs = {
  qfRoundId: Scalars['Int']['input'];
};


export type MutationCreateDonationArgs = {
  input: CreateDonationInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateQfRoundArgs = {
  input: CreateQfRoundInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationRemoveProjectFromQfRoundArgs = {
  projectId: Scalars['Int']['input'];
  qfRoundId: Scalars['Int']['input'];
};


export type MutationRemoveWalletArgs = {
  walletId: Scalars['Int']['input'];
};


export type MutationSetPrimaryWalletArgs = {
  walletId: Scalars['Int']['input'];
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
  projectId: Scalars['Int']['input'];
};


export type MutationUpdateQfRoundArgs = {
  id: Scalars['Int']['input'];
  input: UpdateQfRoundInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationVerifyDonationArgs = {
  input: VerifyDonationInput;
};


export type MutationVerifySiweTokenArgs = {
  jwt: Scalars['String']['input'];
};

export type PaginatedDonationsEntity = {
  __typename?: 'PaginatedDonationsEntity';
  donations: Array<DonationEntity>;
  total: Scalars['Int']['output'];
};

export type PaginatedProjectsEntity = {
  __typename?: 'PaginatedProjectsEntity';
  projects: Array<ProjectEntity>;
  total: Scalars['Int']['output'];
};

export type PaginatedQfRoundsEntity = {
  __typename?: 'PaginatedQfRoundsEntity';
  rounds: Array<QfRoundEntity>;
  total: Scalars['Int']['output'];
};

export type ProjectAddressEntity = {
  __typename?: 'ProjectAddressEntity';
  address: Scalars['String']['output'];
  chainType: ChainType;
  id: Scalars['ID']['output'];
  isRecipient: Scalars['Boolean']['output'];
  networkId: Scalars['Int']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type ProjectAddressInput = {
  address: Scalars['String']['input'];
  chainType?: InputMaybe<ChainType>;
  networkId: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectEntity = {
  __typename?: 'ProjectEntity';
  addresses?: Maybe<Array<ProjectAddressEntity>>;
  adminUser?: Maybe<UserEntity>;
  categories?: Maybe<Array<CategoryEntity>>;
  countUniqueDonors?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  descriptionSummary?: Maybe<Scalars['String']['output']>;
  givbacksEligibilityStatus: GivbacksEligibilityStatusType;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  impactLocation?: Maybe<Scalars['String']['output']>;
  qualityScore: Scalars['Float']['output'];
  reviewStatus: ReviewStatus;
  /** Search relevance score, only populated when using searchTerm filter */
  searchRank?: Maybe<Scalars['Float']['output']>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalDonations: Scalars['Float']['output'];
  totalReactions: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  vouched: Scalars['Boolean']['output'];
};

export type ProjectFiltersInput = {
  /** Filter to show only projects in active QF rounds */
  activeQfRound?: InputMaybe<Scalars['Boolean']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  givbacksEligibilityStatus?: InputMaybe<GivbacksEligibilityStatusType>;
  mainCategory?: InputMaybe<Scalars['String']['input']>;
  qfRoundId?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  vouched?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProjectMatchingEntity = {
  __typename?: 'ProjectMatchingEntity';
  matchingAmount: Scalars['Float']['output'];
  matchingPercent?: Maybe<Scalars['Float']['output']>;
  projectId: Scalars['Int']['output'];
};

export type ProjectQfRoundEntity = {
  __typename?: 'ProjectQfRoundEntity';
  countUniqueDonors: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  project?: Maybe<ProjectEntity>;
  projectId: Scalars['Int']['output'];
  qfRoundId: Scalars['Int']['output'];
  sumDonationValueUsd: Scalars['Float']['output'];
};

/** Fields to sort projects by */
export enum ProjectSortField {
  CreatedAt = 'CreatedAt',
  QualityScore = 'QualityScore',
  Relevance = 'Relevance',
  TotalDonations = 'TotalDonations',
  UpdatedAt = 'UpdatedAt'
}

export type QfRoundEntity = {
  __typename?: 'QfRoundEntity';
  allocatedFund: Scalars['Float']['output'];
  allocatedFundUSD?: Maybe<Scalars['Float']['output']>;
  allocatedTokenChainId?: Maybe<Scalars['Int']['output']>;
  allocatedTokenSymbol?: Maybe<Scalars['String']['output']>;
  bannerBgImage?: Maybe<Scalars['String']['output']>;
  bannerFull?: Maybe<Scalars['String']['output']>;
  bannerMobile?: Maybe<Scalars['String']['output']>;
  beginDate: Scalars['DateTime']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  eligibleNetworks: Array<Scalars['Int']['output']>;
  endDate: Scalars['DateTime']['output'];
  hubCardImage?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDataAnalysisDone: Scalars['Boolean']['output'];
  maximumReward: Scalars['Float']['output'];
  minMBDScore?: Maybe<Scalars['Float']['output']>;
  minimumPassportScore: Scalars['Float']['output'];
  minimumValidUsdValue: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  projectQfRounds?: Maybe<Array<ProjectQfRoundEntity>>;
  qfStrategy: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  sponsorsImgs: Array<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type QfRoundMatchingEntity = {
  __typename?: 'QfRoundMatchingEntity';
  calculatedAt: Scalars['DateTime']['output'];
  projectMatching: Array<ProjectMatchingEntity>;
  qfRoundId: Scalars['Int']['output'];
  totalMatchingPool: Scalars['Float']['output'];
};

export type QfRoundStatsEntity = {
  __typename?: 'QfRoundStatsEntity';
  donationsCount: Scalars['Int']['output'];
  qfRound: QfRoundEntity;
  totalDonationsUsd: Scalars['Float']['output'];
  uniqueDonors: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  activeQfRounds: Array<QfRoundEntity>;
  archivedQfRounds: PaginatedQfRoundsEntity;
  categories: Array<CategoryEntity>;
  donation: DonationEntity;
  donationsByProject: PaginatedDonationsEntity;
  estimatedMatching: EstimatedMatchingEntity;
  mainCategories: Array<MainCategoryEntity>;
  me: UserEntity;
  myDonations: PaginatedDonationsEntity;
  project: ProjectEntity;
  projectBySlug: ProjectEntity;
  projectDonationStats: DonationStatsEntity;
  /** Get paginated projects with optional filters including search term and active QF round filter */
  projects: PaginatedProjectsEntity;
  qfRound: QfRoundEntity;
  qfRoundBySlug: QfRoundEntity;
  qfRoundStats: QfRoundStatsEntity;
  qfRounds: PaginatedQfRoundsEntity;
  tokens: Array<TokenEntity>;
  tokensByNetwork: Array<TokenEntity>;
  user?: Maybe<UserEntity>;
  userByAddress?: Maybe<UserEntity>;
  userStats?: Maybe<UserStatsEntity>;
};


export type QueryArchivedQfRoundsArgs = {
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryDonationArgs = {
  id: Scalars['Int']['input'];
};


export type QueryDonationsByProjectArgs = {
  projectId: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryEstimatedMatchingArgs = {
  donationAmount: Scalars['Float']['input'];
  donorAddress: Scalars['String']['input'];
  projectId: Scalars['Int']['input'];
  qfRoundId: Scalars['Int']['input'];
};


export type QueryMyDonationsArgs = {
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryProjectArgs = {
  id: Scalars['Int']['input'];
};


export type QueryProjectBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryProjectDonationStatsArgs = {
  projectId: Scalars['Int']['input'];
  qfRoundId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProjectsArgs = {
  filters?: InputMaybe<ProjectFiltersInput>;
  orderBy?: ProjectSortField;
  orderDirection?: SortDirection;
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryQfRoundArgs = {
  id: Scalars['Int']['input'];
};


export type QueryQfRoundBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryQfRoundStatsArgs = {
  qfRoundId: Scalars['Int']['input'];
};


export type QueryQfRoundsArgs = {
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryTokensByNetworkArgs = {
  networkId: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};


export type QueryUserByAddressArgs = {
  address: Scalars['String']['input'];
};


export type QueryUserStatsArgs = {
  id: Scalars['Int']['input'];
};

export enum ReviewStatus {
  Listed = 'LISTED',
  NotListed = 'NOT_LISTED',
  NotReviewed = 'NOT_REVIEWED'
}

export type SiweAuthResponse = {
  __typename?: 'SiweAuthResponse';
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
  user?: Maybe<AuthUser>;
};

/** Sort direction (asc or desc) */
export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type TokenEntity = {
  __typename?: 'TokenEntity';
  address?: Maybe<Scalars['String']['output']>;
  chainType: Scalars['String']['output'];
  coingeckoId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  decimals: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  networkId: Scalars['Int']['output'];
  symbol: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UpdateProjectInput = {
  categoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  impactLocation?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQfRoundInput = {
  allocatedFund?: InputMaybe<Scalars['Float']['input']>;
  allocatedFundUSD?: InputMaybe<Scalars['Float']['input']>;
  allocatedTokenChainId?: InputMaybe<Scalars['Int']['input']>;
  allocatedTokenSymbol?: InputMaybe<Scalars['String']['input']>;
  bannerBgImage?: InputMaybe<Scalars['String']['input']>;
  bannerFull?: InputMaybe<Scalars['String']['input']>;
  bannerMobile?: InputMaybe<Scalars['String']['input']>;
  beginDate?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  eligibleNetworks?: InputMaybe<Array<Scalars['Int']['input']>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hubCardImage?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maximumReward?: InputMaybe<Scalars['Float']['input']>;
  minMBDScore?: InputMaybe<Scalars['Float']['input']>;
  minimumPassportScore?: InputMaybe<Scalars['Float']['input']>;
  minimumValidUsdValue?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  qfStrategy?: InputMaybe<Scalars['String']['input']>;
  sponsorsImgs?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  primaryEns?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UserEntity = {
  __typename?: 'UserEntity';
  avatar?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  passportScore?: Maybe<Scalars['Float']['output']>;
  passportStamps?: Maybe<Scalars['Int']['output']>;
  primaryEns?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  totalDonated: Scalars['Float']['output'];
  totalReceived: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
  wallets: Array<UserWalletEntity>;
};

export type UserStatsEntity = {
  __typename?: 'UserStatsEntity';
  avatar?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  donationsCount: Scalars['Int']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  likedProjectsCount: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  passportScore?: Maybe<Scalars['Float']['output']>;
  passportStamps?: Maybe<Scalars['Int']['output']>;
  primaryEns?: Maybe<Scalars['String']['output']>;
  projectsCount: Scalars['Int']['output'];
  role: Scalars['String']['output'];
  totalDonated: Scalars['Float']['output'];
  totalReceived: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
  wallets: Array<UserWalletEntity>;
};

export type UserWalletEntity = {
  __typename?: 'UserWalletEntity';
  address: Scalars['String']['output'];
  chainType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isPrimary: Scalars['Boolean']['output'];
};

export type VerifyDonationInput = {
  donationId: Scalars['Int']['input'];
};

export type ActiveQfRoundsQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveQfRoundsQuery = { __typename?: 'Query', activeQfRounds: Array<{ __typename?: 'QfRoundEntity', id: string, name: string, slug: string, isActive: boolean, beginDate: any, endDate: any, projectQfRounds?: Array<{ __typename?: 'ProjectQfRoundEntity', sumDonationValueUsd: number, countUniqueDonors: number, project?: { __typename?: 'ProjectEntity', id: string, title: string, slug: string, image?: string | null, descriptionSummary?: string | null, adminUser?: { __typename?: 'UserEntity', name?: string | null, firstName?: string | null, lastName?: string | null } | null } | null }> | null }> };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null, isActive: boolean, canUseOnFrontend: boolean, mainCategory?: { __typename?: 'MainCategoryEntity', id: string, title: string, slug: string } | null }> };

export type MainCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type MainCategoriesQuery = { __typename?: 'Query', mainCategories: Array<{ __typename?: 'MainCategoryEntity', id: string, title: string, slug: string, description?: string | null, banner?: string | null, categories?: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null, isActive: boolean, canUseOnFrontend: boolean }> | null }> };

export type ProjectBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ProjectBySlugQuery = { __typename?: 'Query', projectBySlug: { __typename?: 'ProjectEntity', id: string, title: string, slug: string, description?: string | null, image?: string | null, descriptionSummary?: string | null, impactLocation?: string | null, createdAt: any, updatedAt: any, totalDonations: number, countUniqueDonors?: number | null, vouched: boolean, givbacksEligibilityStatus: GivbacksEligibilityStatusType, adminUser?: { __typename?: 'UserEntity', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, avatar?: string | null } | null, categories?: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null, mainCategory?: { __typename?: 'MainCategoryEntity', id: string, title: string, slug: string } | null }> | null, addresses?: Array<{ __typename?: 'ProjectAddressEntity', id: string, address: string, networkId: number, title?: string | null, chainType: ChainType }> | null } };

export type DonationsByProjectQueryVariables = Exact<{
  projectId: Scalars['Int']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DonationsByProjectQuery = { __typename?: 'Query', donationsByProject: { __typename?: 'PaginatedDonationsEntity', total: number, donations: Array<{ __typename?: 'DonationEntity', id: string, amount: number, valueUsd?: number | null, currency: string, transactionId: string, transactionNetworkId: number, fromWalletAddress: string, createdAt: any, user?: { __typename?: 'UserEntity', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, avatar?: string | null } | null }> } };

export type ProjectsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectSortField>;
  orderDirection?: InputMaybe<SortDirection>;
  filters?: InputMaybe<ProjectFiltersInput>;
}>;


export type ProjectsQuery = { __typename?: 'Query', projects: { __typename?: 'PaginatedProjectsEntity', total: number, projects: Array<{ __typename?: 'ProjectEntity', id: string, title: string, slug: string, image?: string | null, descriptionSummary?: string | null, totalDonations: number, countUniqueDonors?: number | null, qualityScore: number, vouched: boolean, givbacksEligibilityStatus: GivbacksEligibilityStatusType, searchRank?: number | null, adminUser?: { __typename?: 'UserEntity', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, avatar?: string | null } | null, categories?: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null, mainCategory?: { __typename?: 'MainCategoryEntity', id: string, title: string, slug: string } | null }> | null, addresses?: Array<{ __typename?: 'ProjectAddressEntity', id: string, address: string, networkId: number, title?: string | null, chainType: ChainType }> | null }> } };

export type QfRoundStatsQueryVariables = Exact<{
  qfRoundId: Scalars['Int']['input'];
}>;


export type QfRoundStatsQuery = { __typename?: 'Query', qfRoundStats: { __typename?: 'QfRoundStatsEntity', totalDonationsUsd: number, donationsCount: number, uniqueDonors: number, qfRound: { __typename?: 'QfRoundEntity', id: string, name: string, slug: string } } };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const ActiveQfRoundsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<ActiveQfRoundsQuery, ActiveQfRoundsQueryVariables>;
export const CategoriesDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<CategoriesQuery, CategoriesQueryVariables>;
export const MainCategoriesDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<MainCategoriesQuery, MainCategoriesQueryVariables>;
export const ProjectBySlugDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<ProjectBySlugQuery, ProjectBySlugQueryVariables>;
export const DonationsByProjectDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<DonationsByProjectQuery, DonationsByProjectQueryVariables>;
export const ProjectsDocument = new TypedDocumentString(`
    query Projects($skip: Int = 0, $take: Int = 20, $orderBy: ProjectSortField = CreatedAt, $orderDirection: SortDirection = DESC, $filters: ProjectFiltersInput) {
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
    `) as unknown as TypedDocumentString<ProjectsQuery, ProjectsQueryVariables>;
export const QfRoundStatsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<QfRoundStatsQuery, QfRoundStatsQueryVariables>;