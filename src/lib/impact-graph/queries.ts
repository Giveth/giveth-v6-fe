export const impactGraphUserExistsByAddressQuery = `
  query UserExistsByAddress($address: String!) {
    userExistsByAddress(address: $address)
  }
`

export const impactGraphCreateUserByAddressMutation = `
  mutation CreateUserByAddress($address: String!) {
    createUserByAddress(address: $address) {
      existing
      user {
        id
        walletAddress
      }
    }
  }
`

export const impactGraphProjectBySlugForQfApplyQuery = `
  query ProjectBySlug($slug: String!) {
    projectBySlug(slug: $slug) {
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
`
