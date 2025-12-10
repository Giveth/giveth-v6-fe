export const createProjectMutation = `
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
`

export const updateProjectMutation = `
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
`

export const updateProfileMutation = `
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
`

export const requestEmailVerificationMutation = `
  mutation RequestEmailVerification($input: RequestEmailVerificationInput!) {
    requestEmailVerification(input: $input) {
      status
      email
      expiresAt
    }
  }
`

export const confirmEmailVerificationMutation = `
  mutation ConfirmEmailVerification($input: ConfirmEmailVerificationInput!) {
    confirmEmailVerification(input: $input) {
      id
      email
      isEmailVerified
    }
  }
`

export const uploadAvatarMutation = `
  mutation UploadAvatar($file: Upload!) {
    createAvatarUploadUrl(file: $file)
  }
`

export const verifySiweTokenMutation = `
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
`
