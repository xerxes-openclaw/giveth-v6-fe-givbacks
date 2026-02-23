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
        chainType
        memo
      }
      socialMedia {
        id
        type
        link
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
        memo
      }
      socialMedia {
        id
        type
        link
      }
    }
  }
`)

// export const updateProfileMutation = graphql(`
//   mutation UpdateProfile($input: UpdateUserInput!) {
//     updateUser(input: $input) {
//       id
//       email
//       firstName
//       lastName
//       name
//       avatar
//       url
//       location
//       twitterName
//       telegramName
//       isEmailVerified
//     }
//   }
// `)

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

// export const checkWalletUserMutation = graphql(`
//   mutation CheckWalletUser($walletAddress: String!) {
//     checkWalletUser(walletAddress: $walletAddress) {
//       success
//       user {
//         id
//         email
//         name
//         avatar
//         primaryWallet
//       }
//       error
//     }
//   }
// `)

// =============================================================
// GIVbacks Verification Form Mutations
// NOTE: These use raw GraphQL strings (not the codegen wrapper)
// because the backend schema types for verification are not yet
// in our generated types. Run `pnpm codegen` locally after
// merging to generate proper TypeScript types.
// =============================================================

export const CREATE_PROJECT_VERIFICATION_FORM = `
  mutation CreateProjectVerificationForm($slug: String!) {
    createProjectVerificationForm(slug: $slug) {
      id
      status
      lastStep
      isTermAndConditionsAccepted
      email
      personalInfo {
        email
        walletAddress
        fullName
      }
      socialProfiles {
        id
        name
        socialNetwork
        socialNetworkId
        isVerified
      }
      projectRegistry {
        organizationDescription
        isNonProfitOrganization
        organizationCountry
        organizationWebsite
        organizationName
        attachments
      }
      projectContacts {
        name
        url
      }
      milestones {
        mission
        foundationDate
        achievedMilestones
        achievedMilestonesProofs
        problem
        plans
        impact
      }
      managingFunds {
        description
        relatedAddresses {
          address
          networkId
          chainType
          title
        }
      }
      project {
        id
        slug
        title
      }
      user {
        id
        walletAddress
        firstName
        lastName
        email
      }
    }
  }
`

export const UPDATE_PROJECT_VERIFICATION_FORM = `
  mutation UpdateProjectVerificationForm(
    $projectVerificationUpdateInput: ProjectVerificationUpdateInput!
  ) {
    updateProjectVerificationForm(
      projectVerificationUpdateInput: $projectVerificationUpdateInput
    ) {
      id
      status
      lastStep
      isTermAndConditionsAccepted
      email
      personalInfo {
        email
        walletAddress
        fullName
      }
      socialProfiles {
        id
        name
        socialNetwork
        socialNetworkId
        isVerified
      }
      projectRegistry {
        organizationDescription
        isNonProfitOrganization
        organizationCountry
        organizationWebsite
        organizationName
        attachments
      }
      projectContacts {
        name
        url
      }
      milestones {
        mission
        foundationDate
        achievedMilestones
        achievedMilestonesProofs
        problem
        plans
        impact
      }
      managingFunds {
        description
        relatedAddresses {
          address
          networkId
          chainType
          title
        }
      }
      project {
        id
        slug
        title
      }
      user {
        id
        walletAddress
        firstName
        lastName
        email
      }
    }
  }
`
