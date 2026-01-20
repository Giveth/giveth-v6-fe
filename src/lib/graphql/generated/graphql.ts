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
  /** JSON custom scalar type */
  JSON: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type AddWalletInput = {
  address: Scalars['String']['input'];
};

export type AllocatedGivbacksEntity = {
  __typename?: 'AllocatedGivbacksEntity';
  allocatedGivTokens: Scalars['Float']['output'];
  date: Scalars['DateTime']['output'];
  givPrice: Scalars['Float']['output'];
  usdValueSentAmountInPowerRound: Scalars['Float']['output'];
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

export type CauseEntity = {
  __typename?: 'CauseEntity';
  addresses?: Maybe<Array<ProjectAddressEntity>>;
  adminUser?: Maybe<UserEntity>;
  adminUserId: Scalars['Int']['output'];
  categories?: Maybe<Array<CategoryEntity>>;
  countUniqueDonors?: Maybe<Scalars['Int']['output']>;
  countUniqueDonorsForActiveQfRound?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  descriptionSummary?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  impactLocation?: Maybe<Scalars['String']['output']>;
  isGivbacksEligible: Scalars['Boolean']['output'];
  latestUpdateCreationDate?: Maybe<Scalars['DateTime']['output']>;
  powerRank?: Maybe<Scalars['Int']['output']>;
  projectQfRounds: Array<ProjectQfRoundEntity>;
  projectType: ProjectType;
  qfRoundMatchingProjects?: Maybe<Array<QfRoundMatchingProjectEntity>>;
  qualityScore: Scalars['Float']['output'];
  reviewStatus: ReviewStatus;
  /** Search relevance score, only populated when using searchTerm filter */
  searchRank?: Maybe<Scalars['Float']['output']>;
  slug: Scalars['String']['output'];
  slugHistory: Array<Scalars['String']['output']>;
  socialMedia?: Maybe<Array<ProjectSocialMediaEntity>>;
  status?: Maybe<ProjectStatus>;
  sumDonationValueUsdForActiveQfRound?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
  totalDonations: Scalars['Float']['output'];
  totalProjectUpdates?: Maybe<Scalars['Int']['output']>;
  totalReactions: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  vouched: Scalars['Boolean']['output'];
};

export enum ChainType {
  Evm = 'EVM',
  Solana = 'SOLANA'
}

export type CheckEligibilityResultEntity = {
  __typename?: 'CheckEligibilityResultEntity';
  eligibility?: Maybe<PassportEligibilityEntity>;
  expirationDate?: Maybe<Scalars['DateTime']['output']>;
  isEligible: Scalars['Boolean']['output'];
  mbdScore?: Maybe<Scalars['Float']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  passportScore?: Maybe<Scalars['Float']['output']>;
  threshold?: Maybe<Scalars['Float']['output']>;
};

export type CheckPassportEligibilityInput = {
  address: Scalars['String']['input'];
  qfRoundId?: InputMaybe<Scalars['Float']['input']>;
};

export type CommentEntity = {
  __typename?: 'CommentEntity';
  content?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
};

export type CommentsSectionEntity = {
  __typename?: 'CommentsSectionEntity';
  comments?: Maybe<Array<CommentEntity>>;
};

export type ConfirmEmailVerificationInput = {
  email: Scalars['String']['input'];
  verifyCode: Scalars['String']['input'];
};

export type Country = {
  __typename?: 'Country';
  code: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

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
  projectType?: InputMaybe<ProjectType>;
  title: Scalars['String']['input'];
};

export type CreateProjectUpdateInput = {
  content: Scalars['String']['input'];
  contentSummary?: InputMaybe<Scalars['String']['input']>;
  isMain?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};

export type CreateQfRoundInput = {
  allocatedFund: Scalars['Float']['input'];
  allocatedFundUSD?: InputMaybe<Scalars['Float']['input']>;
  allocatedFundUSDPreferred?: InputMaybe<Scalars['Boolean']['input']>;
  allocatedTokenChainId?: InputMaybe<Scalars['Int']['input']>;
  allocatedTokenSymbol?: InputMaybe<Scalars['String']['input']>;
  bannerBgImage?: InputMaybe<Scalars['String']['input']>;
  bannerFull?: InputMaybe<Scalars['String']['input']>;
  bannerMobile?: InputMaybe<Scalars['String']['input']>;
  beginDate: Scalars['String']['input'];
  clusterMatchingSyncAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displaySize?: InputMaybe<DisplaySize>;
  eligibleNetworks?: InputMaybe<Array<Scalars['Int']['input']>>;
  endDate: Scalars['String']['input'];
  hubCardImage?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maximumReward?: InputMaybe<Scalars['Float']['input']>;
  minMBDScore?: InputMaybe<Scalars['Float']['input']>;
  minimumPassportScore: Scalars['Float']['input'];
  minimumValidUsdValue?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  qfStrategy?: InputMaybe<Scalars['String']['input']>;
  sponsorsImgs?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export enum DisplaySize {
  Large = 'LARGE',
  Standard = 'STANDARD'
}

export type DonationCurrencyStatsEntity = {
  __typename?: 'DonationCurrencyStatsEntity';
  currency?: Maybe<Scalars['String']['output']>;
  currencyPercentage?: Maybe<Scalars['Float']['output']>;
  uniqueDonorCount?: Maybe<Scalars['Int']['output']>;
};

export type DonationEntity = {
  __typename?: 'DonationEntity';
  amount: Scalars['Float']['output'];
  anonymous?: Maybe<Scalars['Boolean']['output']>;
  chainType: ChainType;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  donationPercentage?: Maybe<Scalars['Float']['output']>;
  fromWalletAddress: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCustomToken: Scalars['Boolean']['output'];
  isExternal: Scalars['Boolean']['output'];
  isProjectGivbackEligible: Scalars['Boolean']['output'];
  nonce?: Maybe<Scalars['Float']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
  project?: Maybe<ProjectEntity>;
  projectId: Scalars['Int']['output'];
  qfRoundErrorMessage?: Maybe<Scalars['String']['output']>;
  qfRoundId?: Maybe<Scalars['Int']['output']>;
  qfRoundUserScore?: Maybe<Scalars['Float']['output']>;
  status: DonationStatus;
  toWalletAddress: Scalars['String']['output'];
  tokenAddress?: Maybe<Scalars['String']['output']>;
  transactionId: Scalars['String']['output'];
  transactionNetworkId: Scalars['Int']['output'];
  useDonationBox: Scalars['Boolean']['output'];
  user?: Maybe<UserEntity>;
  userId?: Maybe<Scalars['Int']['output']>;
  valueUsd?: Maybe<Scalars['Float']['output']>;
  verifyErrorMessage?: Maybe<Scalars['String']['output']>;
};

export type DonationMetricsEntity = {
  __typename?: 'DonationMetricsEntity';
  averagePercentageToGiveth: Scalars['Float']['output'];
  totalDonationsToGiveth: Scalars['Int']['output'];
  totalUsdValueToGiveth: Scalars['Float']['output'];
};

/** Fields to sort donations by */
export enum DonationSortField {
  Amount = 'Amount',
  CreatedAt = 'CreatedAt',
  ValueUsd = 'ValueUsd'
}

export type DonationStatsEntity = {
  __typename?: 'DonationStatsEntity';
  donationsCount: Scalars['Int']['output'];
  totalAmount: Scalars['Float']['output'];
  totalUsd: Scalars['Float']['output'];
  uniqueDonors: Scalars['Int']['output'];
};

/** Status of a donation */
export enum DonationStatus {
  Failed = 'FAILED',
  Pending = 'PENDING',
  Timeout = 'TIMEOUT',
  Verified = 'VERIFIED'
}

export type EmailVerificationRequestEntity = {
  __typename?: 'EmailVerificationRequestEntity';
  email: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
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

export type FeaturedUpdateEntity = {
  __typename?: 'FeaturedUpdateEntity';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  position?: Maybe<Scalars['Int']['output']>;
  projectId?: Maybe<Scalars['Int']['output']>;
  projectUpdateId?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type FormRelatedAddressEntity = {
  __typename?: 'FormRelatedAddressEntity';
  address?: Maybe<Scalars['String']['output']>;
  chainType?: Maybe<ChainType>;
  memo?: Maybe<Scalars['String']['output']>;
  networkId?: Maybe<Scalars['Float']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type FormRelatedAddressInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  chainType?: InputMaybe<Scalars['String']['input']>;
  memo?: InputMaybe<Scalars['String']['input']>;
  networkId?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type GetPassportEligibilityInput = {
  address: Scalars['String']['input'];
};

export type GetPowerBoostingInput = {
  orderBy?: InputMaybe<PowerBoostingOrderByInput>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
  userId?: InputMaybe<Scalars['Int']['input']>;
};

export type GivPowersEntity = {
  __typename?: 'GivPowersEntity';
  powerBoostings: Array<PowerBoostingEntity>;
  totalCount: Scalars['Int']['output'];
};

export type GivbacksEligibilityFormEntity = {
  __typename?: 'GivbacksEligibilityFormEntity';
  commentsSection?: Maybe<CommentsSectionEntity>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  emailConfirmationSent: Scalars['Boolean']['output'];
  emailConfirmationSentAt?: Maybe<Scalars['DateTime']['output']>;
  emailConfirmationToken?: Maybe<Scalars['String']['output']>;
  emailConfirmationTokenExpiredAt?: Maybe<Scalars['DateTime']['output']>;
  emailConfirmed: Scalars['Boolean']['output'];
  emailConfirmedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  isTermAndConditionsAccepted: Scalars['Boolean']['output'];
  lastStep?: Maybe<Scalars['String']['output']>;
  managingFunds?: Maybe<ManagingFundsEntity>;
  milestones?: Maybe<MilestonesEntity>;
  personalInfo?: Maybe<PersonalInfoEntity>;
  projectContacts?: Maybe<Array<ProjectContactsEntity>>;
  projectId: Scalars['Int']['output'];
  projectRegistry?: Maybe<ProjectRegistryEntity>;
  reviewerId?: Maybe<Scalars['Int']['output']>;
  status: GivbacksEligibilityStatus;
  updatedAt: Scalars['DateTime']['output'];
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
};

export enum GivbacksEligibilityStatus {
  Draft = 'DRAFT',
  Rejected = 'REJECTED',
  Submitted = 'SUBMITTED',
  Verified = 'VERIFIED'
}

export type GivbacksEligibilityUpdateInput = {
  givbacksEligibilityId: Scalars['Int']['input'];
  isTermAndConditionsAccepted?: InputMaybe<Scalars['Boolean']['input']>;
  lastStep?: InputMaybe<Scalars['String']['input']>;
  managingFunds?: InputMaybe<ManagingFundsInput>;
  milestones?: InputMaybe<MilestonesInput>;
  personalInfo?: InputMaybe<PersonalInfoInput>;
  projectContacts?: InputMaybe<Array<ProjectContactsInput>>;
  projectRegistry?: InputMaybe<ProjectRegistryInput>;
};

export type GlobalConfigurationEntity = {
  __typename?: 'GlobalConfigurationEntity';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  value?: Maybe<Scalars['String']['output']>;
};

export type ImpactGraphUserWebhookInput = {
  id: Scalars['Int']['input'];
  walletAddress: Scalars['String']['input'];
};

export type LikeResponseEntity = {
  __typename?: 'LikeResponseEntity';
  liked: Scalars['Boolean']['output'];
  reactionId?: Maybe<Scalars['Int']['output']>;
};

export type MainCategoryDonationsEntity = {
  __typename?: 'MainCategoryDonationsEntity';
  id: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalUsd: Scalars['Float']['output'];
};

export type MainCategoryEntity = {
  __typename?: 'MainCategoryEntity';
  banner?: Maybe<Scalars['String']['output']>;
  categories?: Maybe<Array<CategoryEntity>>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ManagingFundsEntity = {
  __typename?: 'ManagingFundsEntity';
  description?: Maybe<Scalars['String']['output']>;
  relatedAddresses?: Maybe<Array<FormRelatedAddressEntity>>;
};

export type ManagingFundsInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  relatedAddresses?: InputMaybe<Array<FormRelatedAddressInput>>;
};

export type MilestonesEntity = {
  __typename?: 'MilestonesEntity';
  achievedMilestones?: Maybe<Scalars['String']['output']>;
  achievedMilestonesProofs?: Maybe<Array<Scalars['String']['output']>>;
  foundationDate?: Maybe<Scalars['String']['output']>;
  impact?: Maybe<Scalars['String']['output']>;
  mission?: Maybe<Scalars['String']['output']>;
  plans?: Maybe<Scalars['String']['output']>;
  problem?: Maybe<Scalars['String']['output']>;
};

export type MilestonesInput = {
  achievedMilestones?: InputMaybe<Scalars['String']['input']>;
  achievedMilestonesProofs?: InputMaybe<Array<Scalars['String']['input']>>;
  foundationDate?: InputMaybe<Scalars['String']['input']>;
  impact?: InputMaybe<Scalars['String']['input']>;
  mission?: InputMaybe<Scalars['String']['input']>;
  plans?: InputMaybe<Scalars['String']['input']>;
  problem?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addNewSocialProfile: Scalars['String']['output'];
  addProjectAddress: ProjectEntity;
  addProjectToQfRound: Scalars['Boolean']['output'];
  addProjectUpdate: ProjectUpdateEntity;
  addWallet: UserEntity;
  calculateQfRoundMatching: QfRoundMatchingEntity;
  confirmEmailVerification: UserEntity;
  createAvatarUploadUrl: Scalars['String']['output'];
  createCause: CauseEntity;
  createDonation: DonationEntity;
  createGivbacksEligibilityForm: GivbacksEligibilityFormEntity;
  createProject: ProjectEntity;
  createQfRound: QfRoundEntity;
  deleteProjectUpdate: Scalars['Boolean']['output'];
  editProjectUpdate: ProjectUpdateEntity;
  givbacksEligibilityConfirmEmail: GivbacksEligibilityFormEntity;
  givbacksEligibilitySendEmailConfirmation: GivbacksEligibilityFormEntity;
  /** Impact-Graph webhook (password header) to sync newly created users into v6-core. */
  impactGraphUpsertUser: UserEntity;
  likeProject: LikeResponseEntity;
  likeProjectUpdate: LikeResponseEntity;
  /** Refresh Passport score by fetching latest data from Passport API. Use this when user wants to update their score after adding new stamps. */
  refreshPassportScore: CheckEligibilityResultEntity;
  removeProjectFromQfRound: Scalars['Boolean']['output'];
  removeSocialProfile: Scalars['Boolean']['output'];
  removeWallet: UserEntity;
  requestEmailVerification: EmailVerificationRequestEntity;
  setFeaturedProjectUpdate: Scalars['Boolean']['output'];
  setMultiplePowerBoosting: Array<PowerBoostingEntity>;
  setPrimaryWallet: UserEntity;
  setSinglePowerBoosting: Array<PowerBoostingEntity>;
  unlikeProject: Scalars['Boolean']['output'];
  unlikeProjectUpdate: Scalars['Boolean']['output'];
  updateCause: CauseEntity;
  updateDonationStatus: DonationEntity;
  updateGivbacksEligibilityForm: GivbacksEligibilityFormEntity;
  updateProject: ProjectEntity;
  updateQfRound: QfRoundEntity;
  verifyDonation: DonationEntity;
  verifySiweToken: SiweAuthResponse;
};


export type MutationAddNewSocialProfileArgs = {
  projectVerificationId: Scalars['Int']['input'];
  socialNetwork: Scalars['String']['input'];
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


export type MutationAddProjectUpdateArgs = {
  input: CreateProjectUpdateInput;
  projectId: Scalars['Int']['input'];
};


export type MutationAddWalletArgs = {
  input: AddWalletInput;
};


export type MutationCalculateQfRoundMatchingArgs = {
  qfRoundId: Scalars['Int']['input'];
};


export type MutationConfirmEmailVerificationArgs = {
  input: ConfirmEmailVerificationInput;
};


export type MutationCreateAvatarUploadUrlArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationCreateCauseArgs = {
  input: CreateProjectInput;
};


export type MutationCreateDonationArgs = {
  input: CreateDonationInput;
};


export type MutationCreateGivbacksEligibilityFormArgs = {
  slug: Scalars['String']['input'];
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateQfRoundArgs = {
  input: CreateQfRoundInput;
};


export type MutationDeleteProjectUpdateArgs = {
  updateId: Scalars['Int']['input'];
};


export type MutationEditProjectUpdateArgs = {
  input: UpdateProjectUpdateInput;
  updateId: Scalars['Int']['input'];
};


export type MutationGivbacksEligibilityConfirmEmailArgs = {
  emailConfirmationToken: Scalars['String']['input'];
};


export type MutationGivbacksEligibilitySendEmailConfirmationArgs = {
  givbacksEligibilityFormId: Scalars['Int']['input'];
};


export type MutationImpactGraphUpsertUserArgs = {
  input: ImpactGraphUserWebhookInput;
};


export type MutationLikeProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationLikeProjectUpdateArgs = {
  projectUpdateId: Scalars['Int']['input'];
};


export type MutationRefreshPassportScoreArgs = {
  input: RefreshPassportScoreInput;
};


export type MutationRemoveProjectFromQfRoundArgs = {
  projectId: Scalars['Int']['input'];
  qfRoundId: Scalars['Int']['input'];
};


export type MutationRemoveSocialProfileArgs = {
  socialProfileId: Scalars['Int']['input'];
};


export type MutationRemoveWalletArgs = {
  walletId: Scalars['Int']['input'];
};


export type MutationRequestEmailVerificationArgs = {
  input: RequestEmailVerificationInput;
};


export type MutationSetFeaturedProjectUpdateArgs = {
  position?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  projectUpdateId: Scalars['Int']['input'];
};


export type MutationSetMultiplePowerBoostingArgs = {
  percentages: Array<Scalars['Float']['input']>;
  projectIds: Array<Scalars['Int']['input']>;
};


export type MutationSetPrimaryWalletArgs = {
  walletId: Scalars['Int']['input'];
};


export type MutationSetSinglePowerBoostingArgs = {
  percentage: Scalars['Float']['input'];
  projectId: Scalars['Int']['input'];
};


export type MutationUnlikeProjectArgs = {
  reactionId: Scalars['Int']['input'];
};


export type MutationUnlikeProjectUpdateArgs = {
  reactionId: Scalars['Int']['input'];
};


export type MutationUpdateCauseArgs = {
  causeId: Scalars['Int']['input'];
  input: UpdateProjectInput;
};


export type MutationUpdateDonationStatusArgs = {
  donationId: Scalars['Int']['input'];
  status?: InputMaybe<DonationStatus>;
};


export type MutationUpdateGivbacksEligibilityFormArgs = {
  givbacksEligibilityUpdateInput: GivbacksEligibilityUpdateInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
  projectId: Scalars['Int']['input'];
};


export type MutationUpdateQfRoundArgs = {
  id: Scalars['Int']['input'];
  input: UpdateQfRoundInput;
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
  totalUsdBalance?: Maybe<Scalars['Float']['output']>;
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

export type PassportEligibilityEntity = {
  __typename?: 'PassportEligibilityEntity';
  address: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['String']['output']>;
  expirationTimestamp?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  lastScoreTimestamp?: Maybe<Scalars['DateTime']['output']>;
  mbdScore?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  stamps?: Maybe<Scalars['JSON']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PersonalInfoEntity = {
  __typename?: 'PersonalInfoEntity';
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  walletAddress?: Maybe<Scalars['String']['output']>;
};

export type PersonalInfoInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export type PowerBoostingEntity = {
  __typename?: 'PowerBoostingEntity';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  percentage: Scalars['Float']['output'];
  powerRank?: Maybe<Scalars['Int']['output']>;
  project?: Maybe<ProjectEntity>;
  projectId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<UserEntity>;
  userId: Scalars['Int']['output'];
};

export type PowerBoostingOrderByInput = {
  direction?: PowerBoostingOrderDirection;
  field?: PowerBoostingOrderField;
};

export enum PowerBoostingOrderDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum PowerBoostingOrderField {
  CreatedAt = 'CreatedAt',
  Percentage = 'Percentage',
  UpdatedAt = 'UpdatedAt'
}

export type ProjectAddressEntity = {
  __typename?: 'ProjectAddressEntity';
  address: Scalars['String']['output'];
  chainType: ChainType;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isRecipient: Scalars['Boolean']['output'];
  networkId: Scalars['Int']['output'];
  projectId: Scalars['Int']['output'];
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ProjectAddressInput = {
  address: Scalars['String']['input'];
  chainType?: InputMaybe<ChainType>;
  networkId: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectContactsEntity = {
  __typename?: 'ProjectContactsEntity';
  name?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type ProjectContactsInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectEntity = {
  __typename?: 'ProjectEntity';
  addresses?: Maybe<Array<ProjectAddressEntity>>;
  adminUser?: Maybe<UserEntity>;
  adminUserId: Scalars['Int']['output'];
  categories?: Maybe<Array<CategoryEntity>>;
  countUniqueDonors?: Maybe<Scalars['Int']['output']>;
  countUniqueDonorsForActiveQfRound?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  descriptionSummary?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  impactLocation?: Maybe<Scalars['String']['output']>;
  isGivbacksEligible: Scalars['Boolean']['output'];
  latestUpdateCreationDate?: Maybe<Scalars['DateTime']['output']>;
  powerRank?: Maybe<Scalars['Int']['output']>;
  projectQfRounds: Array<ProjectQfRoundEntity>;
  projectType: ProjectType;
  qfRoundMatchingProjects?: Maybe<Array<QfRoundMatchingProjectEntity>>;
  qualityScore: Scalars['Float']['output'];
  reviewStatus: ReviewStatus;
  /** Search relevance score, only populated when using searchTerm filter */
  searchRank?: Maybe<Scalars['Float']['output']>;
  slug: Scalars['String']['output'];
  slugHistory: Array<Scalars['String']['output']>;
  socialMedia?: Maybe<Array<ProjectSocialMediaEntity>>;
  status?: Maybe<ProjectStatus>;
  sumDonationValueUsdForActiveQfRound?: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
  totalDonations: Scalars['Float']['output'];
  totalProjectUpdates?: Maybe<Scalars['Int']['output']>;
  totalReactions: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  vouched: Scalars['Boolean']['output'];
};

export type ProjectFiltersInput = {
  /** Filter to show only projects in active QF rounds */
  activeQfRound?: InputMaybe<Scalars['Boolean']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  isGivbacksEligible?: InputMaybe<Scalars['Boolean']['input']>;
  mainCategory?: InputMaybe<Scalars['String']['input']>;
  /** Filter projects by accepted recipient networks (EVM chain IDs / networkId) */
  networkIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectType?: InputMaybe<ProjectType>;
  qfRoundId?: InputMaybe<Scalars['Int']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  vouched?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ProjectMatchingContextEntity = {
  __typename?: 'ProjectMatchingContextEntity';
  allProjectsSqrtSum: Scalars['Float']['output'];
  contributorCount: Scalars['Int']['output'];
  currentMatching: Scalars['Float']['output'];
  /** The matching calculation strategy (REGULAR or COCM) */
  estimationMethod: Scalars['String']['output'];
  lastUpdated: Scalars['DateTime']['output'];
  matchingPool: Scalars['Float']['output'];
  projectId: Scalars['Int']['output'];
  qfRoundId: Scalars['Int']['output'];
  roundEndDate: Scalars['DateTime']['output'];
  roundStartDate: Scalars['DateTime']['output'];
  sqrtSum: Scalars['Float']['output'];
  totalDonationsUsd: Scalars['Float']['output'];
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
  qfRound?: Maybe<QfRoundEntity>;
  qfRoundId: Scalars['Int']['output'];
  sumDonationValueUsd: Scalars['Float']['output'];
};

export type ProjectRegistryEntity = {
  __typename?: 'ProjectRegistryEntity';
  attachments?: Maybe<Array<Scalars['String']['output']>>;
  isNonProfitOrganization?: Maybe<Scalars['Boolean']['output']>;
  organizationCountry?: Maybe<Scalars['String']['output']>;
  organizationDescription?: Maybe<Scalars['String']['output']>;
  organizationName?: Maybe<Scalars['String']['output']>;
  organizationWebsite?: Maybe<Scalars['String']['output']>;
};

export type ProjectRegistryInput = {
  attachments?: InputMaybe<Array<Scalars['String']['input']>>;
  isNonProfitOrganization?: InputMaybe<Scalars['Boolean']['input']>;
  organizationCountry?: InputMaybe<Scalars['String']['input']>;
  organizationDescription?: InputMaybe<Scalars['String']['input']>;
  organizationName?: InputMaybe<Scalars['String']['input']>;
  organizationWebsite?: InputMaybe<Scalars['String']['input']>;
};

export type ProjectSocialMediaEntity = {
  __typename?: 'ProjectSocialMediaEntity';
  id: Scalars['ID']['output'];
  link: Scalars['String']['output'];
  projectId: Scalars['Int']['output'];
  type: Scalars['String']['output'];
};

/** Fields to sort projects by */
export enum ProjectSortField {
  CreatedAt = 'CreatedAt',
  QfDonations = 'QfDonations',
  QualityScore = 'QualityScore',
  Relevance = 'Relevance',
  TotalDonations = 'TotalDonations',
  UpdatedAt = 'UpdatedAt'
}

export enum ProjectStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Clarification = 'CLARIFICATION',
  Deactive = 'DEACTIVE',
  Drafted = 'DRAFTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Verification = 'VERIFICATION'
}

export enum ProjectType {
  Cause = 'CAUSE',
  Project = 'PROJECT'
}

export type ProjectUpdateEntity = {
  __typename?: 'ProjectUpdateEntity';
  content: Scalars['String']['output'];
  contentSummary?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isMain?: Maybe<Scalars['Boolean']['output']>;
  projectId: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  totalReactions: Scalars['Int']['output'];
};

export type ProjectUpdateQueryInput = {
  isMain?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<SortDirection>;
  projectId: Scalars['Int']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type ProjectUpdatesResult = {
  __typename?: 'ProjectUpdatesResult';
  projectUpdates: Array<ProjectUpdateEntity>;
  totalCount: Scalars['Int']['output'];
};

export type QfRoundEntity = {
  __typename?: 'QfRoundEntity';
  allocatedFund: Scalars['Float']['output'];
  allocatedFundUSD?: Maybe<Scalars['Float']['output']>;
  allocatedFundUSDPreferred?: Maybe<Scalars['Boolean']['output']>;
  allocatedTokenChainId?: Maybe<Scalars['Int']['output']>;
  allocatedTokenSymbol?: Maybe<Scalars['String']['output']>;
  bannerBgImage?: Maybe<Scalars['String']['output']>;
  bannerFull?: Maybe<Scalars['String']['output']>;
  bannerMobile?: Maybe<Scalars['String']['output']>;
  beginDate: Scalars['DateTime']['output'];
  clusterMatchingSyncAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  displaySize?: Maybe<DisplaySize>;
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
  priority: Scalars['Int']['output'];
  qfStrategy: QfStrategy;
  slug: Scalars['String']['output'];
  sponsorsImgs: Array<Scalars['String']['output']>;
  sybilDefense: SybilDefenseType;
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

export type QfRoundMatchingProjectEntity = {
  __typename?: 'QfRoundMatchingProjectEntity';
  deltaMatch?: Maybe<Scalars['Float']['output']>;
  deltaTqf?: Maybe<Scalars['Float']['output']>;
  deltaTqfCocm?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  matchingAmount: Scalars['Float']['output'];
  matchingAmountQf?: Maybe<Scalars['Float']['output']>;
  matchingAmountTqf?: Maybe<Scalars['Float']['output']>;
  matchingAmountTqfCocm?: Maybe<Scalars['Float']['output']>;
  matchingAmountUsd?: Maybe<Scalars['Float']['output']>;
  matchingPercent?: Maybe<Scalars['Float']['output']>;
  projectId: Scalars['Int']['output'];
  qfRoundMatchingId: Scalars['Int']['output'];
};

export type QfRoundStatsEntity = {
  __typename?: 'QfRoundStatsEntity';
  donationsCount: Scalars['Int']['output'];
  qfRound: QfRoundEntity;
  totalDonationsUsd: Scalars['Float']['output'];
  uniqueDonors: Scalars['Int']['output'];
};

export enum QfStrategy {
  Cocm = 'COCM',
  Regular = 'REGULAR'
}

export type Query = {
  __typename?: 'Query';
  activeQfRounds: Array<QfRoundEntity>;
  allocatedGivbacks?: Maybe<AllocatedGivbacksEntity>;
  archivedQfRounds: PaginatedQfRoundsEntity;
  categories: Array<CategoryEntity>;
  cause?: Maybe<CauseEntity>;
  causeBySlug?: Maybe<CauseEntity>;
  causes: Array<CauseEntity>;
  /** Check Passport eligibility for an address. Returns cached data if not expired, otherwise fetches from Passport API. */
  checkPassportEligibility: CheckEligibilityResultEntity;
  doesDonatedToProjectInQfRound: Scalars['Boolean']['output'];
  donation: DonationEntity;
  donationMetrics: DonationMetricsEntity;
  donationsByProject: PaginatedDonationsEntity;
  donationsByUser: PaginatedDonationsEntity;
  donationsTotalUsdPerDate?: Maybe<ResourcePerDateRangeEntity>;
  estimatedMatching: EstimatedMatchingEntity;
  featuredProjectUpdate?: Maybe<FeaturedUpdateEntity>;
  featuredProjects: PaginatedProjectsEntity;
  getAllowedCountries: Array<Country>;
  getCurrentGivbacksEligibilityForm: GivbacksEligibilityFormEntity;
  getDonationById?: Maybe<DonationEntity>;
  getDonationStats: Array<DonationCurrencyStatsEntity>;
  /** Get stored Passport eligibility data without fetching from API. */
  getPassportEligibility?: Maybe<PassportEligibilityEntity>;
  getPowerBoosting: GivPowersEntity;
  getProjectReactions: Array<ReactionEntity>;
  getTopPowerRank: Scalars['Float']['output'];
  globalConfiguration?: Maybe<GlobalConfigurationEntity>;
  globalConfigurations: Array<GlobalConfigurationEntity>;
  isValidCauseTitle: Scalars['Boolean']['output'];
  isValidCauseTitleForEdit: Scalars['Boolean']['output'];
  isValidWalletAddress: Scalars['Boolean']['output'];
  mainCategories: Array<MainCategoryEntity>;
  me: UserEntity;
  myDonations: PaginatedDonationsEntity;
  myProjects: PaginatedProjectsEntity;
  project: ProjectEntity;
  projectBySlug: ProjectEntity;
  projectDonationStats: DonationStatsEntity;
  projectMatchingContext?: Maybe<ProjectMatchingContextEntity>;
  projectUpdates: ProjectUpdatesResult;
  /** Get paginated projects with optional filters including search term and active QF round filter */
  projects: PaginatedProjectsEntity;
  qfRound: QfRoundEntity;
  qfRoundBySlug: QfRoundEntity;
  qfRoundStats: QfRoundStatsEntity;
  qfRounds: PaginatedQfRoundsEntity;
  recentDonations?: Maybe<Array<DonationEntity>>;
  refreshUserScores?: Maybe<UserEntity>;
  similarProjectsBySlug: PaginatedProjectsEntity;
  subscribeOnboarding: Scalars['Boolean']['output'];
  tokens: Array<TokenEntity>;
  tokensByNetwork: Array<TokenEntity>;
  totalDonationsNumberPerDate?: Maybe<ResourcePerDateRangeEntity>;
  totalDonationsPerCategory?: Maybe<Array<MainCategoryDonationsEntity>>;
  totalDonorsCountPerDate?: Maybe<ResourcePerDateRangeEntity>;
  user?: Maybe<UserEntity>;
  userByAddress?: Maybe<UserEntity>;
  userStats?: Maybe<UserStatsEntity>;
  validateEmail: Scalars['Boolean']['output'];
  walletAddressIsPurpleListed: Scalars['Boolean']['output'];
  walletAddressUsed: WalletAddressUsedEntity;
};


export type QueryAllocatedGivbacksArgs = {
  refreshCache?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryArchivedQfRoundsArgs = {
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryCauseArgs = {
  id: Scalars['Int']['input'];
};


export type QueryCauseBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryCausesArgs = {
  filters?: InputMaybe<ProjectFiltersInput>;
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryCheckPassportEligibilityArgs = {
  input: CheckPassportEligibilityInput;
};


export type QueryDoesDonatedToProjectInQfRoundArgs = {
  projectId: Scalars['Int']['input'];
  qfRoundId: Scalars['Int']['input'];
  userId: Scalars['Int']['input'];
};


export type QueryDonationArgs = {
  id: Scalars['Int']['input'];
};


export type QueryDonationMetricsArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryDonationsByProjectArgs = {
  orderBy?: DonationSortField;
  orderDirection?: SortDirection;
  projectId: Scalars['Int']['input'];
  qfRoundId?: InputMaybe<Scalars['Int']['input']>;
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryDonationsByUserArgs = {
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
  userId: Scalars['Int']['input'];
};


export type QueryDonationsTotalUsdPerDateArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  networkId?: InputMaybe<Scalars['Int']['input']>;
  onlyVerified?: InputMaybe<Scalars['Boolean']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEstimatedMatchingArgs = {
  donationAmount: Scalars['Float']['input'];
  donorAddress: Scalars['String']['input'];
  projectId: Scalars['Int']['input'];
  qfRoundId: Scalars['Int']['input'];
};


export type QueryFeaturedProjectUpdateArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryFeaturedProjectsArgs = {
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryGetCurrentGivbacksEligibilityFormArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetDonationByIdArgs = {
  id: Scalars['Int']['input'];
};


export type QueryGetDonationStatsArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  networkId?: InputMaybe<Scalars['Int']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetPassportEligibilityArgs = {
  input: GetPassportEligibilityInput;
};


export type QueryGetPowerBoostingArgs = {
  input: GetPowerBoostingInput;
};


export type QueryGetProjectReactionsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryGlobalConfigurationArgs = {
  key: Scalars['String']['input'];
};


export type QueryGlobalConfigurationsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryIsValidCauseTitleArgs = {
  causeId?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};


export type QueryIsValidCauseTitleForEditArgs = {
  causeId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};


export type QueryIsValidWalletAddressArgs = {
  address: Scalars['String']['input'];
};


export type QueryMyDonationsArgs = {
  orderBy?: DonationSortField;
  orderDirection?: SortDirection;
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
};


export type QueryMyProjectsArgs = {
  filters?: InputMaybe<ProjectFiltersInput>;
  orderBy?: ProjectSortField;
  orderDirection?: SortDirection;
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


export type QueryProjectMatchingContextArgs = {
  projectId: Scalars['Int']['input'];
  qfRoundId: Scalars['Int']['input'];
};


export type QueryProjectUpdatesArgs = {
  input: ProjectUpdateQueryInput;
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


export type QueryRecentDonationsArgs = {
  take?: Scalars['Int']['input'];
};


export type QueryRefreshUserScoresArgs = {
  address: Scalars['String']['input'];
};


export type QuerySimilarProjectsBySlugArgs = {
  skip?: Scalars['Int']['input'];
  slug: Scalars['String']['input'];
  take?: Scalars['Int']['input'];
};


export type QuerySubscribeOnboardingArgs = {
  email: Scalars['String']['input'];
};


export type QueryTokensByNetworkArgs = {
  networkId: Scalars['Int']['input'];
};


export type QueryTotalDonationsNumberPerDateArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  networkId?: InputMaybe<Scalars['Int']['input']>;
  onlyVerified?: InputMaybe<Scalars['Boolean']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTotalDonationsPerCategoryArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  networkId?: InputMaybe<Scalars['Int']['input']>;
  onlyVerified?: InputMaybe<Scalars['Boolean']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTotalDonorsCountPerDateArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  networkId?: InputMaybe<Scalars['Int']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
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


export type QueryValidateEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryWalletAddressIsPurpleListedArgs = {
  address: Scalars['String']['input'];
};


export type QueryWalletAddressUsedArgs = {
  address: Scalars['String']['input'];
};

export type ReactionEntity = {
  __typename?: 'ReactionEntity';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  projectId?: Maybe<Scalars['Int']['output']>;
  projectUpdateId?: Maybe<Scalars['Int']['output']>;
  reaction: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['Int']['output'];
};

export type RefreshPassportScoreInput = {
  address: Scalars['String']['input'];
};

export type RequestEmailVerificationInput = {
  email: Scalars['String']['input'];
};

export type ResourcePerDateRangeEntity = {
  __typename?: 'ResourcePerDateRangeEntity';
  total?: Maybe<Scalars['Float']['output']>;
  totalPerMonthAndYear?: Maybe<Array<ResourcesTotalPerMonthAndYearEntity>>;
};

export type ResourcesTotalPerMonthAndYearEntity = {
  __typename?: 'ResourcesTotalPerMonthAndYearEntity';
  date?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
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

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum SybilDefenseType {
  AvalanchePassport = 'AVALANCHE_PASSPORT',
  None = 'NONE',
  PassportModel = 'PASSPORT_MODEL',
  PassportStamps = 'PASSPORT_STAMPS'
}

export type TokenEntity = {
  __typename?: 'TokenEntity';
  address?: Maybe<Scalars['String']['output']>;
  chainType: ChainType;
  coingeckoId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  decimals: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isGivbacksEligible: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  networkId: Scalars['Int']['output'];
  symbol: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UpdateProjectInput = {
  addresses?: InputMaybe<Array<ProjectAddressInput>>;
  categoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  impactLocation?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectUpdateInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  contentSummary?: InputMaybe<Scalars['String']['input']>;
  isMain?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQfRoundInput = {
  allocatedFund?: InputMaybe<Scalars['Float']['input']>;
  allocatedFundUSD?: InputMaybe<Scalars['Float']['input']>;
  allocatedFundUSDPreferred?: InputMaybe<Scalars['Boolean']['input']>;
  allocatedTokenChainId?: InputMaybe<Scalars['Int']['input']>;
  allocatedTokenSymbol?: InputMaybe<Scalars['String']['input']>;
  bannerBgImage?: InputMaybe<Scalars['String']['input']>;
  bannerFull?: InputMaybe<Scalars['String']['input']>;
  bannerMobile?: InputMaybe<Scalars['String']['input']>;
  beginDate?: InputMaybe<Scalars['String']['input']>;
  clusterMatchingSyncAt?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displaySize?: InputMaybe<DisplaySize>;
  eligibleNetworks?: InputMaybe<Array<Scalars['Int']['input']>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  hubCardImage?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maximumReward?: InputMaybe<Scalars['Float']['input']>;
  minMBDScore?: InputMaybe<Scalars['Float']['input']>;
  minimumPassportScore?: InputMaybe<Scalars['Float']['input']>;
  minimumValidUsdValue?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  qfStrategy?: InputMaybe<Scalars['String']['input']>;
  sponsorsImgs?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
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
  location?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  passportScore?: Maybe<Scalars['Float']['output']>;
  passportStamps?: Maybe<Scalars['Int']['output']>;
  primaryEns?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  telegramName?: Maybe<Scalars['String']['output']>;
  totalDonated: Scalars['Float']['output'];
  totalReceived: Scalars['Float']['output'];
  twitterName?: Maybe<Scalars['String']['output']>;
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
  location?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  passportScore?: Maybe<Scalars['Float']['output']>;
  passportStamps?: Maybe<Scalars['Int']['output']>;
  primaryEns?: Maybe<Scalars['String']['output']>;
  projectsCount: Scalars['Int']['output'];
  projectsWithDonationsCount: Scalars['Int']['output'];
  role: Scalars['String']['output'];
  telegramName?: Maybe<Scalars['String']['output']>;
  totalDonated: Scalars['Float']['output'];
  totalReceived: Scalars['Float']['output'];
  twitterName?: Maybe<Scalars['String']['output']>;
  uniqueProjectsDonatedTo: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url?: Maybe<Scalars['String']['output']>;
  wallets: Array<UserWalletEntity>;
};

export type UserWalletEntity = {
  __typename?: 'UserWalletEntity';
  address: Scalars['String']['output'];
  chainType: ChainType;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isPrimary: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['Int']['output'];
};

export type VerifyDonationInput = {
  donationId: Scalars['Int']['input'];
};

export type WalletAddressUsedEntity = {
  __typename?: 'WalletAddressUsedEntity';
  hasDonated: Scalars['Boolean']['output'];
  hasRelatedProject: Scalars['Boolean']['output'];
};

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: { __typename?: 'ProjectEntity', id: string, title: string, slug: string, description?: string | null, image?: string | null, impactLocation?: string | null, createdAt: any, updatedAt: any, categories?: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null }> | null, addresses?: Array<{ __typename?: 'ProjectAddressEntity', id: string, address: string, networkId: number }> | null } };

export type UpdateProjectMutationVariables = Exact<{
  projectId: Scalars['Int']['input'];
  input: UpdateProjectInput;
}>;


export type UpdateProjectMutation = { __typename?: 'Mutation', updateProject: { __typename?: 'ProjectEntity', id: string, title: string, slug: string, description?: string | null, image?: string | null, impactLocation?: string | null, categories?: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null }> | null, addresses?: Array<{ __typename?: 'ProjectAddressEntity', id: string, address: string, networkId: number, chainType: ChainType, title?: string | null }> | null } };

export type RequestEmailVerificationMutationVariables = Exact<{
  input: RequestEmailVerificationInput;
}>;


export type RequestEmailVerificationMutation = { __typename?: 'Mutation', requestEmailVerification: { __typename?: 'EmailVerificationRequestEntity', status: string, email: string, expiresAt: any } };

export type ConfirmEmailVerificationMutationVariables = Exact<{
  input: ConfirmEmailVerificationInput;
}>;


export type ConfirmEmailVerificationMutation = { __typename?: 'Mutation', confirmEmailVerification: { __typename?: 'UserEntity', id: string, email?: string | null, isEmailVerified: boolean } };

export type UploadAvatarMutationVariables = Exact<{
  file: Scalars['Upload']['input'];
}>;


export type UploadAvatarMutation = { __typename?: 'Mutation', createAvatarUploadUrl: string };

export type VerifySiweTokenMutationVariables = Exact<{
  jwt: Scalars['String']['input'];
}>;


export type VerifySiweTokenMutation = { __typename?: 'Mutation', verifySiweToken: { __typename?: 'SiweAuthResponse', success: boolean, token?: string | null, error?: string | null, user?: { __typename?: 'AuthUser', id: number, email?: string | null, name?: string | null, avatar?: string | null, primaryWallet?: string | null } | null } };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null, isActive: boolean, canUseOnFrontend: boolean, mainCategory?: { __typename?: 'MainCategoryEntity', id: string, title: string, slug: string } | null }> };

export type MainCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type MainCategoriesQuery = { __typename?: 'Query', mainCategories: Array<{ __typename?: 'MainCategoryEntity', id: string, title: string, slug: string, description?: string | null, banner?: string | null, categories?: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null, isActive: boolean, canUseOnFrontend: boolean }> | null }> };

export type ProjectBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ProjectBySlugQuery = { __typename?: 'Query', projectBySlug: { __typename?: 'ProjectEntity', id: string, title: string, slug: string, description?: string | null, descriptionSummary?: string | null, image?: string | null, impactLocation?: string | null, createdAt: any, updatedAt: any, totalDonations: number, countUniqueDonors?: number | null, vouched: boolean, isGivbacksEligible: boolean, socialMedia?: Array<{ __typename?: 'ProjectSocialMediaEntity', id: string, type: string, link: string }> | null, adminUser?: { __typename?: 'UserEntity', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, avatar?: string | null } | null, categories?: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null, mainCategory?: { __typename?: 'MainCategoryEntity', id: string, title: string, slug: string } | null }> | null, addresses?: Array<{ __typename?: 'ProjectAddressEntity', id: string, address: string, networkId: number, title?: string | null, chainType: ChainType }> | null, projectQfRounds: Array<{ __typename?: 'ProjectQfRoundEntity', countUniqueDonors: number, sumDonationValueUsd: number, qfRound?: { __typename?: 'QfRoundEntity', id: string, name: string, slug: string, isActive: boolean } | null }> } };

export type QfRoundBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type QfRoundBySlugQuery = { __typename?: 'Query', qfRoundBySlug: { __typename?: 'QfRoundEntity', id: string, name: string, title?: string | null, description?: string | null, slug: string, bannerFull?: string | null, bannerBgImage?: string | null, bannerMobile?: string | null, sponsorsImgs: Array<string>, beginDate: any, endDate: any, allocatedFundUSD?: number | null, allocatedFundUSDPreferred?: boolean | null, allocatedTokenSymbol?: string | null } };

export type ActiveQfRoundsQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveQfRoundsQuery = { __typename?: 'Query', activeQfRounds: Array<{ __typename?: 'QfRoundEntity', id: string, name: string, description?: string | null, slug: string, isActive: boolean, beginDate: any, endDate: any, eligibleNetworks: Array<number>, hubCardImage?: string | null, allocatedFundUSD?: number | null, allocatedFundUSDPreferred?: boolean | null, allocatedFund: number, allocatedTokenSymbol?: string | null, minimumValidUsdValue: number, displaySize?: DisplaySize | null, maximumReward: number }> };

export type DonationsByProjectQueryVariables = Exact<{
  projectId: Scalars['Int']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  orderBy: DonationSortField;
  orderDirection: SortDirection;
  qfRoundId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DonationsByProjectQuery = { __typename?: 'Query', donationsByProject: { __typename?: 'PaginatedDonationsEntity', total: number, donations: Array<{ __typename?: 'DonationEntity', id: string, amount: number, valueUsd?: number | null, currency: string, transactionId: string, transactionNetworkId: number, fromWalletAddress: string, createdAt: any, anonymous?: boolean | null, user?: { __typename?: 'UserEntity', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, avatar?: string | null } | null }> } };

export type ProjectsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectSortField>;
  orderDirection?: InputMaybe<SortDirection>;
  filters?: InputMaybe<ProjectFiltersInput>;
}>;


export type ProjectsQuery = { __typename?: 'Query', projects: { __typename?: 'PaginatedProjectsEntity', total: number, projects: Array<{ __typename?: 'ProjectEntity', id: string, title: string, slug: string, image?: string | null, reviewStatus: ReviewStatus, descriptionSummary?: string | null, totalDonations: number, countUniqueDonors?: number | null, vouched: boolean, isGivbacksEligible: boolean, adminUser?: { __typename?: 'UserEntity', id: string, name?: string | null } | null, projectQfRounds: Array<{ __typename?: 'ProjectQfRoundEntity', id: string, qfRoundId: number, sumDonationValueUsd: number, countUniqueDonors: number }> }> } };

export type SimilarProjectsBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SimilarProjectsBySlugQuery = { __typename?: 'Query', similarProjectsBySlug: { __typename?: 'PaginatedProjectsEntity', total: number, projects: Array<{ __typename?: 'ProjectEntity', id: string, title: string, slug: string, image?: string | null, descriptionSummary?: string | null, totalDonations: number, countUniqueDonors?: number | null, qualityScore: number, searchRank?: number | null, vouched: boolean, isGivbacksEligible: boolean, adminUser?: { __typename?: 'UserEntity', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, avatar?: string | null } | null, categories?: Array<{ __typename?: 'CategoryEntity', id: string, name: string, value?: string | null, mainCategory?: { __typename?: 'MainCategoryEntity', id: string, title: string, slug: string } | null }> | null, addresses?: Array<{ __typename?: 'ProjectAddressEntity', id: string, address: string, networkId: number, title?: string | null, chainType: ChainType }> | null }> } };

export type ArchivedQfRoundsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ArchivedQfRoundsQuery = { __typename?: 'Query', archivedQfRounds: { __typename?: 'PaginatedQfRoundsEntity', total: number, rounds: Array<{ __typename?: 'QfRoundEntity', id: string, name: string, description?: string | null, allocatedFundUSD?: number | null, allocatedFundUSDPreferred?: boolean | null, allocatedFund: number, allocatedTokenSymbol?: string | null, slug: string, isActive: boolean, beginDate: any, endDate: any, hubCardImage?: string | null }> } };

export type QfRoundStatsQueryVariables = Exact<{
  qfRoundId: Scalars['Int']['input'];
}>;


export type QfRoundStatsQuery = { __typename?: 'Query', qfRoundStats: { __typename?: 'QfRoundStatsEntity', totalDonationsUsd: number, donationsCount: number, uniqueDonors: number, qfRound: { __typename?: 'QfRoundEntity', id: string, name: string, slug: string } } };

export type UserProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type UserProfileQuery = { __typename?: 'Query', me: { __typename?: 'UserEntity', id: string, email?: string | null, name?: string | null, firstName?: string | null, lastName?: string | null, avatar?: string | null, primaryEns?: string | null, url?: string | null, totalDonated: number, totalReceived: number, location?: string | null, twitterName?: string | null, telegramName?: string | null, isEmailVerified: boolean, wallets: Array<{ __typename?: 'UserWalletEntity', id: string, address: string, isPrimary: boolean, chainType: ChainType }> } };

export type UserStatsQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type UserStatsQuery = { __typename?: 'Query', userStats?: { __typename?: 'UserStatsEntity', id: string, email?: string | null, name?: string | null, firstName?: string | null, lastName?: string | null, avatar?: string | null, primaryEns?: string | null, url?: string | null, totalDonated: number, totalReceived: number, donationsCount: number, projectsCount: number, likedProjectsCount: number, projectsWithDonationsCount: number, uniqueProjectsDonatedTo: number, wallets: Array<{ __typename?: 'UserWalletEntity', id: string, address: string, isPrimary: boolean, chainType: ChainType }> } | null };

export type MyProjectsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProjectSortField>;
  orderDirection?: InputMaybe<SortDirection>;
}>;


export type MyProjectsQuery = { __typename?: 'Query', myProjects: { __typename?: 'PaginatedProjectsEntity', total: number, projects: Array<{ __typename?: 'ProjectEntity', id: string, title: string, slug: string, createdAt: any, reviewStatus: ReviewStatus, isGivbacksEligible: boolean, vouched: boolean, totalDonations: number }> } };

export type MyDonationsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: DonationSortField;
  orderDirection?: SortDirection;
}>;


export type MyDonationsQuery = { __typename?: 'Query', myDonations: { __typename?: 'PaginatedDonationsEntity', total: number, donations: Array<{ __typename?: 'DonationEntity', id: string, amount: number, valueUsd?: number | null, currency: string, status: DonationStatus, transactionId: string, transactionNetworkId: number, createdAt: any, project?: { __typename?: 'ProjectEntity', id: string, title: string, slug: string } | null }> } };

export type ProjectUpdatesQueryVariables = Exact<{
  input: ProjectUpdateQueryInput;
}>;


export type ProjectUpdatesQuery = { __typename?: 'Query', projectUpdates: { __typename?: 'ProjectUpdatesResult', totalCount: number, projectUpdates: Array<{ __typename?: 'ProjectUpdateEntity', id: string, title: string, projectId: number, content: string, contentSummary?: string | null, createdAt: any, isMain?: boolean | null, totalReactions: number }> } };

export type MeProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type MeProfileQuery = { __typename?: 'Query', me: { __typename?: 'UserEntity', id: string, email?: string | null, firstName?: string | null, lastName?: string | null, name?: string | null, avatar?: string | null, url?: string | null, location?: string | null, twitterName?: string | null, telegramName?: string | null, isEmailVerified: boolean, wallets: Array<{ __typename?: 'UserWalletEntity', id: string, address: string, isPrimary: boolean, chainType: ChainType }> } };

export type TokensQueryVariables = Exact<{ [key: string]: never; }>;


export type TokensQuery = { __typename?: 'Query', tokens: Array<{ __typename?: 'TokenEntity', id: string, name: string, symbol: string, address?: string | null, decimals: number, networkId: number, chainType: ChainType, isActive: boolean, coingeckoId?: string | null }> };

export type TokensByNetworkQueryVariables = Exact<{
  networkId: Scalars['Int']['input'];
}>;


export type TokensByNetworkQuery = { __typename?: 'Query', tokensByNetwork: Array<{ __typename?: 'TokenEntity', id: string, name: string, symbol: string, address?: string | null, decimals: number, networkId: number, chainType: ChainType, isActive: boolean, coingeckoId?: string | null, isGivbacksEligible: boolean }> };

export type EstimatedMatchingQueryVariables = Exact<{
  donationAmount: Scalars['Float']['input'];
  donorAddress: Scalars['String']['input'];
  projectId: Scalars['Int']['input'];
  qfRoundId: Scalars['Int']['input'];
}>;


export type EstimatedMatchingQuery = { __typename?: 'Query', estimatedMatching: { __typename?: 'EstimatedMatchingEntity', projectId: number, qfRoundId: number, matchingPool: number, allProjectsSqrtSum: number, projectDonationsSqrtSum: number, estimatedMatching: number } };

export type CheckPassportEligibilityQueryVariables = Exact<{
  input: CheckPassportEligibilityInput;
}>;


export type CheckPassportEligibilityQuery = { __typename?: 'Query', checkPassportEligibility: { __typename?: 'CheckEligibilityResultEntity', isEligible: boolean, passportScore?: number | null, mbdScore?: number | null, threshold?: number | null, expirationDate?: any | null, message?: string | null, eligibility?: { __typename?: 'PassportEligibilityEntity', id: string, address: string, score?: number | null, mbdScore?: number | null, lastScoreTimestamp?: any | null, expirationTimestamp?: any | null, stamps?: any | null, error?: string | null, createdAt: any, updatedAt: any } | null } };

export type GlobalConfigurationsQueryVariables = Exact<{
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GlobalConfigurationsQuery = { __typename?: 'Query', globalConfigurations: Array<{ __typename?: 'GlobalConfigurationEntity', id: string, key: string, value?: string | null, description?: string | null, type?: string | null, isActive: boolean, createdAt: any, updatedAt: any }> };

export type GlobalConfigurationQueryVariables = Exact<{
  key: Scalars['String']['input'];
}>;


export type GlobalConfigurationQuery = { __typename?: 'Query', globalConfiguration?: { __typename?: 'GlobalConfigurationEntity', id: string, key: string, value?: string | null, description?: string | null, type?: string | null, isActive: boolean, createdAt: any, updatedAt: any } | null };

export type UserByAddressQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type UserByAddressQuery = { __typename?: 'Query', userByAddress?: { __typename?: 'UserEntity', id: string, name?: string | null, firstName?: string | null, lastName?: string | null, avatar?: string | null, primaryEns?: string | null, totalDonated: number, totalReceived: number, createdAt: any, wallets: Array<{ __typename?: 'UserWalletEntity', address: string, chainType: ChainType, isPrimary: boolean }> } | null };

export type DonationsByUserQueryVariables = Exact<{
  userId: Scalars['Int']['input'];
  skip?: Scalars['Int']['input'];
  take?: Scalars['Int']['input'];
}>;


export type DonationsByUserQuery = { __typename?: 'Query', donationsByUser: { __typename?: 'PaginatedDonationsEntity', total: number, donations: Array<{ __typename?: 'DonationEntity', id: string, createdAt: any, amount: number, currency: string, valueUsd?: number | null, status: DonationStatus, transactionId: string, transactionNetworkId: number, projectId: number, qfRoundId?: number | null, project?: { __typename?: 'ProjectEntity', id: string, title: string, slug: string } | null }> } };

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

export const CreateProjectDocument = new TypedDocumentString(`
    mutation CreateProject($input: CreateProjectInput!) {
  createProject(input: $input) {
    id
    title
    slug
    description
    image
    impactLocation
    createdAt
    updatedAt
    categories {
      id
      name
      value
    }
    addresses {
      id
      address
      networkId
    }
  }
}
    `) as unknown as TypedDocumentString<CreateProjectMutation, CreateProjectMutationVariables>;
export const UpdateProjectDocument = new TypedDocumentString(`
    mutation UpdateProject($projectId: Int!, $input: UpdateProjectInput!) {
  updateProject(projectId: $projectId, input: $input) {
    id
    title
    slug
    description
    image
    impactLocation
    categories {
      id
      name
      value
    }
    addresses {
      id
      address
      networkId
      chainType
      title
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const RequestEmailVerificationDocument = new TypedDocumentString(`
    mutation RequestEmailVerification($input: RequestEmailVerificationInput!) {
  requestEmailVerification(input: $input) {
    status
    email
    expiresAt
  }
}
    `) as unknown as TypedDocumentString<RequestEmailVerificationMutation, RequestEmailVerificationMutationVariables>;
export const ConfirmEmailVerificationDocument = new TypedDocumentString(`
    mutation ConfirmEmailVerification($input: ConfirmEmailVerificationInput!) {
  confirmEmailVerification(input: $input) {
    id
    email
    isEmailVerified
  }
}
    `) as unknown as TypedDocumentString<ConfirmEmailVerificationMutation, ConfirmEmailVerificationMutationVariables>;
export const UploadAvatarDocument = new TypedDocumentString(`
    mutation UploadAvatar($file: Upload!) {
  createAvatarUploadUrl(file: $file)
}
    `) as unknown as TypedDocumentString<UploadAvatarMutation, UploadAvatarMutationVariables>;
export const VerifySiweTokenDocument = new TypedDocumentString(`
    mutation VerifySiweToken($jwt: String!) {
  verifySiweToken(jwt: $jwt) {
    success
    token
    user {
      id
      email
      name
      avatar
      primaryWallet
    }
    error
  }
}
    `) as unknown as TypedDocumentString<VerifySiweTokenMutation, VerifySiweTokenMutationVariables>;
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
      countUniqueDonors
      sumDonationValueUsd
      qfRound {
        id
        name
        slug
        isActive
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ProjectBySlugQuery, ProjectBySlugQueryVariables>;
export const QfRoundBySlugDocument = new TypedDocumentString(`
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
    allocatedTokenSymbol
  }
}
    `) as unknown as TypedDocumentString<QfRoundBySlugQuery, QfRoundBySlugQueryVariables>;
export const ActiveQfRoundsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<ActiveQfRoundsQuery, ActiveQfRoundsQueryVariables>;
export const DonationsByProjectDocument = new TypedDocumentString(`
    query DonationsByProject($projectId: Int!, $skip: Int, $take: Int, $orderBy: DonationSortField!, $orderDirection: SortDirection!, $qfRoundId: Int) {
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
    `) as unknown as TypedDocumentString<ProjectsQuery, ProjectsQueryVariables>;
export const SimilarProjectsBySlugDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<SimilarProjectsBySlugQuery, SimilarProjectsBySlugQueryVariables>;
export const ArchivedQfRoundsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<ArchivedQfRoundsQuery, ArchivedQfRoundsQueryVariables>;
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
export const UserProfileDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<UserProfileQuery, UserProfileQueryVariables>;
export const UserStatsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<UserStatsQuery, UserStatsQueryVariables>;
export const MyProjectsDocument = new TypedDocumentString(`
    query MyProjects($skip: Int = 0, $take: Int = 10, $orderBy: ProjectSortField = CreatedAt, $orderDirection: SortDirection = DESC) {
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
    `) as unknown as TypedDocumentString<MyProjectsQuery, MyProjectsQueryVariables>;
export const MyDonationsDocument = new TypedDocumentString(`
    query MyDonations($skip: Int = 0, $take: Int = 20, $orderBy: DonationSortField! = CreatedAt, $orderDirection: SortDirection! = DESC) {
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
      project {
        id
        title
        slug
      }
    }
  }
}
    `) as unknown as TypedDocumentString<MyDonationsQuery, MyDonationsQueryVariables>;
export const ProjectUpdatesDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<ProjectUpdatesQuery, ProjectUpdatesQueryVariables>;
export const MeProfileDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<MeProfileQuery, MeProfileQueryVariables>;
export const TokensDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<TokensQuery, TokensQueryVariables>;
export const TokensByNetworkDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<TokensByNetworkQuery, TokensByNetworkQueryVariables>;
export const EstimatedMatchingDocument = new TypedDocumentString(`
    query EstimatedMatching($donationAmount: Float!, $donorAddress: String!, $projectId: Int!, $qfRoundId: Int!) {
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
    `) as unknown as TypedDocumentString<EstimatedMatchingQuery, EstimatedMatchingQueryVariables>;
export const CheckPassportEligibilityDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<CheckPassportEligibilityQuery, CheckPassportEligibilityQueryVariables>;
export const GlobalConfigurationsDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<GlobalConfigurationsQuery, GlobalConfigurationsQueryVariables>;
export const GlobalConfigurationDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<GlobalConfigurationQuery, GlobalConfigurationQueryVariables>;
export const UserByAddressDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<UserByAddressQuery, UserByAddressQueryVariables>;
export const DonationsByUserDocument = new TypedDocumentString(`
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
      project {
        id
        title
        slug
      }
    }
  }
}
    `) as unknown as TypedDocumentString<DonationsByUserQuery, DonationsByUserQueryVariables>;