'use client'

import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  PROGRESS_STEPS,
  STEP_LABELS,
  useVerificationContext,
} from '@/context/VerificationContext'
import { useVerificationFormInit } from '@/hooks/useVerificationForm'
import type { VerificationStep } from '@/lib/types/verification'
import { BeforeStart } from './steps/BeforeStart'
import { Done } from './steps/Done'
import { ImpactMilestones } from './steps/ImpactMilestones'
import { ManagingFunds } from './steps/ManagingFunds'
import { PersonalInfo } from './steps/PersonalInfo'
import { ProjectContact } from './steps/ProjectContact'
import { Registration } from './steps/Registration'
import { SocialProfiles } from './steps/SocialProfiles'
import { TermsConditions } from './steps/TermsConditions'

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------
function ProgressBar({
  currentIndex,
  total,
}: {
  currentIndex: number
  total: number
}) {
  const percent = total > 1 ? Math.round((currentIndex / (total - 1)) * 100) : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-giv-neutral-700">
          Step {currentIndex + 1} of {total}
        </span>
        <span className="text-sm text-giv-neutral-500">{percent}% complete</span>
      </div>
      <div className="h-2 bg-giv-neutral-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-giv-brand-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      {/* Step labels */}
      <div className="flex justify-between mt-2 overflow-hidden">
        {PROGRESS_STEPS.map((step, idx) => (
          <div
            key={step}
            className={`text-xs text-center hidden md:block flex-1 ${
              idx <= currentIndex
                ? 'text-giv-brand-500 font-medium'
                : 'text-giv-neutral-500'
            }`}
          >
            {STEP_LABELS[step]}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step router
// ---------------------------------------------------------------------------
function StepContent({ step }: { step: VerificationStep }) {
  switch (step) {
    case 'beforeStart':
      return <BeforeStart />
    case 'personalInfo':
      return <PersonalInfo />
    case 'socialProfiles':
      return <SocialProfiles />
    case 'projectRegistry':
      return <Registration />
    case 'projectContacts':
      return <ProjectContact />
    case 'impactMilestones':
      return <ImpactMilestones />
    case 'managingFunds':
      return <ManagingFunds />
    case 'termsConditions':
      return <TermsConditions />
    case 'done':
      return <Done />
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------
export function GivbacksApplicationForm() {
  const { state, slug, setForm, setLoading, setError, currentStepIndex, totalProgressSteps } =
    useVerificationContext()

  const { existingForm, isLoadingForm, loadError, initForm, isBusy } =
    useVerificationFormInit(slug)

  // On mount: load or initialise the form
  useEffect(() => {
    if (isLoadingForm) return

    if (loadError) {
      // loadError could mean "not found" (no form yet) — we handle that in initForm
      const errMsg =
        (loadError as { message?: string })?.message?.toLowerCase() ?? ''
      const isNotFound =
        errMsg.includes('not found') ||
        errMsg.includes('no verification') ||
        errMsg.includes('404')

      if (!isNotFound) {
        setError('Failed to load verification form. Please try again.')
        return
      }
    }

    if (!state.formId) {
      // Either no form exists yet, or we haven't set it yet
      if (existingForm) {
        setForm(existingForm)
      }
      // Don't auto-create here — BeforeStart step has the CTA to start
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingForm, loadError, existingForm])

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (isLoadingForm || state.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-giv-brand-500" />
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------
  if (state.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 font-medium">{state.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-red-700 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const showProgress = state.currentStep !== 'done'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-giv-neutral-900">
          GIVbacks Verification
        </h1>
        <p className="mt-2 text-giv-neutral-600">
          Complete the form below to apply for GIVbacks eligibility for your project.
        </p>
      </div>

      {/* Progress */}
      {showProgress && state.currentStep !== 'beforeStart' && (
        <div className="mb-8">
          <ProgressBar
            currentIndex={Math.max(0, currentStepIndex)}
            total={totalProgressSteps}
          />
        </div>
      )}

      {/* Step content */}
      <div className="bg-white rounded-2xl shadow-sm border border-giv-neutral-200 p-6 md:p-8">
        {isBusy && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-giv-brand-500" />
          </div>
        )}
        <div className="relative">
          <StepContent step={state.currentStep} />
        </div>
      </div>
    </div>
  )
}
