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
