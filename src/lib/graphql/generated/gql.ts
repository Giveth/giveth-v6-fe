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
    "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      title\n      slug\n      description\n      image\n      impactLocation\n      createdAt\n      updatedAt\n      categories {\n        id\n        name\n        value\n      }\n      addresses {\n        id\n        address\n        networkId\n      }\n    }\n  }\n": typeof types.CreateProjectDocument,
    "\n  mutation UpdateProject($projectId: Int!, $input: UpdateProjectInput!) {\n    updateProject(projectId: $projectId, input: $input) {\n      id\n      title\n      slug\n      description\n      image\n      impactLocation\n      categories {\n        id\n        name\n        value\n      }\n      addresses {\n        id\n        address\n        networkId\n        chainType\n        title\n      }\n    }\n  }\n": typeof types.UpdateProjectDocument,
    "\n  mutation RequestEmailVerification($input: RequestEmailVerificationInput!) {\n    requestEmailVerification(input: $input) {\n      status\n      email\n      expiresAt\n    }\n  }\n": typeof types.RequestEmailVerificationDocument,
    "\n  mutation ConfirmEmailVerification($input: ConfirmEmailVerificationInput!) {\n    confirmEmailVerification(input: $input) {\n      id\n      email\n      isEmailVerified\n    }\n  }\n": typeof types.ConfirmEmailVerificationDocument,
    "\n  mutation UploadAvatar($file: Upload!) {\n    createAvatarUploadUrl(file: $file)\n  }\n": typeof types.UploadAvatarDocument,
    "\n  mutation VerifySiweToken($jwt: String!) {\n    verifySiweToken(jwt: $jwt) {\n      success\n      token\n      user {\n        id\n        email\n        name\n        avatar\n        primaryWallet\n      }\n      error\n    }\n  }\n": typeof types.VerifySiweTokenDocument,
};
const documents: Documents = {
    "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      title\n      slug\n      description\n      image\n      impactLocation\n      createdAt\n      updatedAt\n      categories {\n        id\n        name\n        value\n      }\n      addresses {\n        id\n        address\n        networkId\n      }\n    }\n  }\n": types.CreateProjectDocument,
    "\n  mutation UpdateProject($projectId: Int!, $input: UpdateProjectInput!) {\n    updateProject(projectId: $projectId, input: $input) {\n      id\n      title\n      slug\n      description\n      image\n      impactLocation\n      categories {\n        id\n        name\n        value\n      }\n      addresses {\n        id\n        address\n        networkId\n        chainType\n        title\n      }\n    }\n  }\n": types.UpdateProjectDocument,
    "\n  mutation RequestEmailVerification($input: RequestEmailVerificationInput!) {\n    requestEmailVerification(input: $input) {\n      status\n      email\n      expiresAt\n    }\n  }\n": types.RequestEmailVerificationDocument,
    "\n  mutation ConfirmEmailVerification($input: ConfirmEmailVerificationInput!) {\n    confirmEmailVerification(input: $input) {\n      id\n      email\n      isEmailVerified\n    }\n  }\n": types.ConfirmEmailVerificationDocument,
    "\n  mutation UploadAvatar($file: Upload!) {\n    createAvatarUploadUrl(file: $file)\n  }\n": types.UploadAvatarDocument,
    "\n  mutation VerifySiweToken($jwt: String!) {\n    verifySiweToken(jwt: $jwt) {\n      success\n      token\n      user {\n        id\n        email\n        name\n        avatar\n        primaryWallet\n      }\n      error\n    }\n  }\n": types.VerifySiweTokenDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateProject($input: CreateProjectInput!) {\n    createProject(input: $input) {\n      id\n      title\n      slug\n      description\n      image\n      impactLocation\n      createdAt\n      updatedAt\n      categories {\n        id\n        name\n        value\n      }\n      addresses {\n        id\n        address\n        networkId\n      }\n    }\n  }\n"): typeof import('./graphql').CreateProjectDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProject($projectId: Int!, $input: UpdateProjectInput!) {\n    updateProject(projectId: $projectId, input: $input) {\n      id\n      title\n      slug\n      description\n      image\n      impactLocation\n      categories {\n        id\n        name\n        value\n      }\n      addresses {\n        id\n        address\n        networkId\n        chainType\n        title\n      }\n    }\n  }\n"): typeof import('./graphql').UpdateProjectDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RequestEmailVerification($input: RequestEmailVerificationInput!) {\n    requestEmailVerification(input: $input) {\n      status\n      email\n      expiresAt\n    }\n  }\n"): typeof import('./graphql').RequestEmailVerificationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ConfirmEmailVerification($input: ConfirmEmailVerificationInput!) {\n    confirmEmailVerification(input: $input) {\n      id\n      email\n      isEmailVerified\n    }\n  }\n"): typeof import('./graphql').ConfirmEmailVerificationDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UploadAvatar($file: Upload!) {\n    createAvatarUploadUrl(file: $file)\n  }\n"): typeof import('./graphql').UploadAvatarDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifySiweToken($jwt: String!) {\n    verifySiweToken(jwt: $jwt) {\n      success\n      token\n      user {\n        id\n        email\n        name\n        avatar\n        primaryWallet\n      }\n      error\n    }\n  }\n"): typeof import('./graphql').VerifySiweTokenDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
