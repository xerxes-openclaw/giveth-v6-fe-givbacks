'use client'

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  ManagingFunds,
  Milestones,
  PersonalInfo,
  ProjectContact,
  ProjectRegistry,
  ProjectVerificationForm,
  SocialProfile,
  VerificationStep,
} from '@/lib/types/verification'

// ---------------------------------------------------------------------------
// Step order
// ---------------------------------------------------------------------------
export const VERIFICATION_STEPS: VerificationStep[] = [
  'beforeStart',
  'personalInfo',
  'socialProfiles',
  'projectRegistry',
  'projectContacts',
  'impactMilestones',
  'managingFunds',
  'termsConditions',
  'done',
]

export const STEP_LABELS: Record<VerificationStep, string> = {
  beforeStart: 'Before You Start',
  personalInfo: 'Personal Info',
  socialProfiles: 'Social Profiles',
  projectRegistry: 'Registration',
  projectContacts: 'Project Contact',
  impactMilestones: 'Impact & Milestones',
  managingFunds: 'Managing Funds',
  termsConditions: 'Terms & Conditions',
  done: 'Done',
}

// Steps that count toward the progress bar (excludes 'done')
export const PROGRESS_STEPS = VERIFICATION_STEPS.filter(s => s !== 'done')

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
interface VerificationState {
  formId: string | null
  currentStep: VerificationStep
  /** Merged form data from all steps (accumulated over the form lifetime) */
  formData: Partial<ProjectVerificationForm>
  isLoading: boolean
  error: string | null
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
type VerificationAction =
  | { type: 'SET_FORM'; payload: ProjectVerificationForm }
  | { type: 'SET_STEP'; payload: VerificationStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_PERSONAL_INFO'; payload: PersonalInfo }
  | { type: 'UPDATE_SOCIAL_PROFILES'; payload: SocialProfile[] }
  | { type: 'UPDATE_PROJECT_REGISTRY'; payload: ProjectRegistry }
  | { type: 'UPDATE_PROJECT_CONTACTS'; payload: ProjectContact[] }
  | { type: 'UPDATE_MILESTONES'; payload: Milestones }
  | { type: 'UPDATE_MANAGING_FUNDS'; payload: ManagingFunds }
  | { type: 'ACCEPT_TERMS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function verificationReducer(
  state: VerificationState,
  action: VerificationAction,
): VerificationState {
  switch (action.type) {
    case 'SET_FORM': {
      const form = action.payload
      // Determine starting step: resume from lastStep if available
      const resumeStep: VerificationStep =
        form.lastStep && VERIFICATION_STEPS.includes(form.lastStep)
          ? form.lastStep
          : 'beforeStart'
      return {
        ...state,
        formId: form.id,
        formData: form,
        currentStep: resumeStep,
        isLoading: false,
        error: null,
      }
    }
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    case 'NEXT_STEP': {
      const idx = VERIFICATION_STEPS.indexOf(state.currentStep)
      const next = VERIFICATION_STEPS[idx + 1] ?? state.currentStep
      return { ...state, currentStep: next }
    }
    case 'PREV_STEP': {
      const idx = VERIFICATION_STEPS.indexOf(state.currentStep)
      const prev = VERIFICATION_STEPS[idx - 1] ?? state.currentStep
      return { ...state, currentStep: prev }
    }
    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        formData: { ...state.formData, personalInfo: action.payload },
      }
    case 'UPDATE_SOCIAL_PROFILES':
      return {
        ...state,
        formData: { ...state.formData, socialProfiles: action.payload },
      }
    case 'UPDATE_PROJECT_REGISTRY':
      return {
        ...state,
        formData: { ...state.formData, projectRegistry: action.payload },
      }
    case 'UPDATE_PROJECT_CONTACTS':
      return {
        ...state,
        formData: { ...state.formData, projectContacts: action.payload },
      }
    case 'UPDATE_MILESTONES':
      return {
        ...state,
        formData: { ...state.formData, milestones: action.payload },
      }
    case 'UPDATE_MANAGING_FUNDS':
      return {
        ...state,
        formData: { ...state.formData, managingFunds: action.payload },
      }
    case 'ACCEPT_TERMS':
      return {
        ...state,
        formData: { ...state.formData, isTermAndConditionsAccepted: true },
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface VerificationContextValue {
  state: VerificationState
  slug: string
  goNext: () => void
  goPrev: () => void
  goToStep: (step: VerificationStep) => void
  setForm: (form: ProjectVerificationForm) => void
  updatePersonalInfo: (data: PersonalInfo) => void
  updateSocialProfiles: (data: SocialProfile[]) => void
  updateProjectRegistry: (data: ProjectRegistry) => void
  updateProjectContacts: (data: ProjectContact[]) => void
  updateMilestones: (data: Milestones) => void
  updateManagingFunds: (data: ManagingFunds) => void
  acceptTerms: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  currentStepIndex: number
  totalProgressSteps: number
}

const VerificationContext = createContext<VerificationContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
interface VerificationProviderProps {
  children: ReactNode
  slug: string
}

export function VerificationProvider({
  children,
  slug,
}: VerificationProviderProps) {
  const [state, dispatch] = useReducer(verificationReducer, {
    formId: null,
    currentStep: 'beforeStart',
    formData: {},
    isLoading: false,
    error: null,
  })

  const goNext = useCallback(() => dispatch({ type: 'NEXT_STEP' }), [])
  const goPrev = useCallback(() => dispatch({ type: 'PREV_STEP' }), [])
  const goToStep = useCallback(
    (step: VerificationStep) => dispatch({ type: 'SET_STEP', payload: step }),
    [],
  )
  const setForm = useCallback(
    (form: ProjectVerificationForm) =>
      dispatch({ type: 'SET_FORM', payload: form }),
    [],
  )
  const updatePersonalInfo = useCallback(
    (data: PersonalInfo) =>
      dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: data }),
    [],
  )
  const updateSocialProfiles = useCallback(
    (data: SocialProfile[]) =>
      dispatch({ type: 'UPDATE_SOCIAL_PROFILES', payload: data }),
    [],
  )
  const updateProjectRegistry = useCallback(
    (data: ProjectRegistry) =>
      dispatch({ type: 'UPDATE_PROJECT_REGISTRY', payload: data }),
    [],
  )
  const updateProjectContacts = useCallback(
    (data: ProjectContact[]) =>
      dispatch({ type: 'UPDATE_PROJECT_CONTACTS', payload: data }),
    [],
  )
  const updateMilestones = useCallback(
    (data: Milestones) =>
      dispatch({ type: 'UPDATE_MILESTONES', payload: data }),
    [],
  )
  const updateManagingFunds = useCallback(
    (data: ManagingFunds) =>
      dispatch({ type: 'UPDATE_MANAGING_FUNDS', payload: data }),
    [],
  )
  const acceptTerms = useCallback(
    () => dispatch({ type: 'ACCEPT_TERMS' }),
    [],
  )
  const setLoading = useCallback(
    (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading }),
    [],
  )
  const setError = useCallback(
    (error: string | null) =>
      dispatch({ type: 'SET_ERROR', payload: error }),
    [],
  )

  const currentStepIndex = PROGRESS_STEPS.indexOf(
    state.currentStep as VerificationStep,
  )
  const totalProgressSteps = PROGRESS_STEPS.length

  const value: VerificationContextValue = {
    state,
    slug,
    goNext,
    goPrev,
    goToStep,
    setForm,
    updatePersonalInfo,
    updateSocialProfiles,
    updateProjectRegistry,
    updateProjectContacts,
    updateMilestones,
    updateManagingFunds,
    acceptTerms,
    setLoading,
    setError,
    currentStepIndex,
    totalProgressSteps,
  }

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useVerificationContext() {
  const ctx = useContext(VerificationContext)
  if (!ctx) {
    throw new Error(
      'useVerificationContext must be used within a VerificationProvider',
    )
  }
  return ctx
}
