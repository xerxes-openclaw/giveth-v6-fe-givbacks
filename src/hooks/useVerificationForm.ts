import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createGraphQLClient } from '@/lib/graphql/client'
import {
  CREATE_PROJECT_VERIFICATION_FORM,
  UPDATE_PROJECT_VERIFICATION_FORM,
} from '@/lib/graphql/mutations'
import {
  GET_ALLOWED_COUNTRIES,
  GET_CURRENT_PROJECT_VERIFICATION_FORM,
} from '@/lib/graphql/queries'
import type {
  ProjectVerificationForm,
  ProjectVerificationUpdateInput,
} from '@/lib/types/verification'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates an authenticated GraphQL client using the JWT stored in localStorage.
 * The token is read at call time (not at hook initialization) so it's always current.
 */
function getAuthClient() {
  const token =
    typeof window !== 'undefined'
      ? (localStorage.getItem('giveth_token') ?? '')
      : ''
  return createGraphQLClient({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

// ---------------------------------------------------------------------------
// Query: get current verification form for a project
// ---------------------------------------------------------------------------
export function useCurrentVerificationForm(slug: string) {
  return useQuery<ProjectVerificationForm | null>({
    queryKey: ['verificationForm', slug],
    queryFn: async () => {
      const client = getAuthClient()
      const data = await client.request<{
        getCurrentProjectVerificationForm: ProjectVerificationForm | null
      }>(GET_CURRENT_PROJECT_VERIFICATION_FORM, { slug })
      return data.getCurrentProjectVerificationForm
    },
    enabled: !!slug,
    retry: false,
    // Treat "no form yet" (null) as valid — don't refetch aggressively
    staleTime: 30_000,
  })
}

// ---------------------------------------------------------------------------
// Mutation: create verification form
// ---------------------------------------------------------------------------
export function useCreateVerificationForm() {
  const queryClient = useQueryClient()

  return useMutation<ProjectVerificationForm, Error, { slug: string }>({
    mutationFn: async ({ slug }) => {
      const client = getAuthClient()
      const data = await client.request<{
        createProjectVerificationForm: ProjectVerificationForm
      }>(CREATE_PROJECT_VERIFICATION_FORM, { slug })
      return data.createProjectVerificationForm
    },
    onSuccess: (form, { slug }) => {
      // Update the cache so the query doesn't refetch unnecessarily
      queryClient.setQueryData(['verificationForm', slug], form)
    },
  })
}

// ---------------------------------------------------------------------------
// Mutation: update verification form (called on each step submit)
// ---------------------------------------------------------------------------
export function useUpdateVerificationForm(slug: string) {
  const queryClient = useQueryClient()

  return useMutation<
    ProjectVerificationForm,
    Error,
    Omit<ProjectVerificationUpdateInput, 'projectVerificationId'> & {
      projectVerificationId: string
    }
  >({
    mutationFn: async input => {
      const client = getAuthClient()
      const data = await client.request<{
        updateProjectVerificationForm: ProjectVerificationForm
      }>(UPDATE_PROJECT_VERIFICATION_FORM, {
        projectVerificationUpdateInput: input,
      })
      return data.updateProjectVerificationForm
    },
    onSuccess: updatedForm => {
      // Keep the cached form in sync
      queryClient.setQueryData(['verificationForm', slug], updatedForm)
    },
  })
}

// ---------------------------------------------------------------------------
// Query: allowed countries (for the Registration step dropdown)
// ---------------------------------------------------------------------------
export function useAllowedCountries() {
  return useQuery<{ name: string }[]>({
    queryKey: ['allowedCountries'],
    queryFn: async () => {
      const client = getAuthClient()
      const data = await client.request<{
        getAllowedCountries: { name: string }[]
      }>(GET_ALLOWED_COUNTRIES)
      return data.getAllowedCountries
    },
    staleTime: 60 * 60 * 1000, // 1 hour — country list changes rarely
  })
}

// ---------------------------------------------------------------------------
// Convenience: combined hook for use inside GivbacksApplicationForm
// Initialises the form (creates or loads existing) and returns helpers.
// ---------------------------------------------------------------------------
export function useVerificationFormInit(slug: string) {
  const queryClient = useQueryClient()

  const {
    data: existingForm,
    isLoading: isLoadingForm,
    error: loadError,
  } = useCurrentVerificationForm(slug)

  const createMutation = useCreateVerificationForm()
  const updateMutation = useUpdateVerificationForm(slug)

  const initForm = useCallback(async () => {
    // If we already have a form, return it
    if (existingForm) return existingForm
    // Otherwise create one
    return createMutation.mutateAsync({ slug })
  }, [existingForm, createMutation, slug])

  return {
    existingForm,
    isLoadingForm,
    loadError,
    initForm,
    createMutation,
    updateMutation,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isBusy: createMutation.isPending || updateMutation.isPending,
  }
}
