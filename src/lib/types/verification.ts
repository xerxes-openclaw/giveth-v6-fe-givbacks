/**
 * GIVbacks Verification Form Types
 *
 * These are manually defined because the backend's verification schema
 * is not yet part of our GraphQL codegen. Run `pnpm codegen` after the
 * backend exposes these types in the introspection schema.
 */

export type SocialNetwork =
  | 'FACEBOOK'
  | 'TWITTER'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'LINKEDIN'
  | 'REDDIT'
  | 'DISCORD'
  | 'GITHUB'
  | 'TELEGRAM'
  | 'FARCASTER'

export interface SocialProfile {
  id?: string
  name?: string
  socialNetwork: SocialNetwork
  socialNetworkId?: string
  isVerified?: boolean
}

export interface ProjectRegistry {
  organizationDescription?: string
  isNonProfitOrganization?: boolean
  organizationCountry?: string
  organizationWebsite?: string
  organizationName?: string
  attachments?: string[]
}

export interface PersonalInfo {
  email?: string
  walletAddress?: string
  fullName?: string
}

export interface ProjectContact {
  name: string
  url: string
}

export interface Milestones {
  mission?: string
  foundationDate?: string
  achievedMilestones?: string
  achievedMilestonesProofs?: string[]
  problem?: string
  plans?: string
  impact?: string
}

export interface RelatedAddress {
  address: string
  networkId: number
  chainType?: string
  title?: string
}

export interface ManagingFunds {
  description?: string
  relatedAddresses?: RelatedAddress[]
}

export type VerificationStatus =
  | 'draft'
  | 'submitted'
  | 'verified'
  | 'rejected'
  | 'revoked'

export type VerificationStep =
  | 'beforeStart'
  | 'personalInfo'
  | 'socialProfiles'
  | 'projectRegistry'
  | 'projectContacts'
  | 'impactMilestones'
  | 'managingFunds'
  | 'termsConditions'
  | 'done'

export interface ProjectVerificationForm {
  id: string
  status: VerificationStatus
  lastStep?: VerificationStep | null
  isTermAndConditionsAccepted: boolean
  email?: string | null
  personalInfo?: PersonalInfo | null
  socialProfiles?: SocialProfile[] | null
  projectRegistry?: ProjectRegistry | null
  projectContacts?: ProjectContact[] | null
  milestones?: Milestones | null
  managingFunds?: ManagingFunds | null
  project?: {
    id: string
    slug: string
    title: string
  } | null
  user?: {
    id: string
    walletAddress?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
}

export interface ProjectVerificationUpdateInput {
  projectVerificationId: string
  step?: VerificationStep
  personalInfo?: PersonalInfo
  socialProfiles?: Omit<SocialProfile, 'id' | 'isVerified'>[]
  projectRegistry?: ProjectRegistry
  projectContacts?: ProjectContact[]
  milestones?: Milestones
  managingFunds?: ManagingFunds
  isTermAndConditionsAccepted?: boolean
}
