import { graphql } from './generated'

export const createProjectMutation = graphql(`
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
`)

export const updateProjectMutation = graphql(`
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
`)

export const updateProfileMutation = graphql(`
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateUser(input: $input) {
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
    }
  }
`)

export const requestEmailVerificationMutation = graphql(`
  mutation RequestEmailVerification($input: RequestEmailVerificationInput!) {
    requestEmailVerification(input: $input) {
      status
      email
      expiresAt
    }
  }
`)

export const confirmEmailVerificationMutation = graphql(`
  mutation ConfirmEmailVerification($input: ConfirmEmailVerificationInput!) {
    confirmEmailVerification(input: $input) {
      id
      email
      isEmailVerified
    }
  }
`)

export const uploadAvatarMutation = graphql(`
  mutation UploadAvatar($file: Upload!) {
    createAvatarUploadUrl(file: $file)
  }
`)

export const verifySiweTokenMutation = graphql(`
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
`)

export const checkWalletUserMutation = graphql(`
  mutation CheckWalletUser($walletAddress: String!) {
    checkWalletUser(walletAddress: $walletAddress) {
      success
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
`)
