'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useVerificationContext } from '@/context/VerificationContext'
import { useUpdateVerificationForm } from '@/hooks/useVerificationForm'

export function TermsConditions() {
  const { state, slug, goPrev, goNext, acceptTerms, setError } =
    useVerificationContext()
  const updateMutation = useUpdateVerificationForm(slug)

  const [accepted, setAccepted] = useState(
    state.formData.isTermAndConditionsAccepted ?? false,
  )
  const [touched, setTouched] = useState(false)

  const handleAcceptChange = (checked: boolean | 'indeterminate') => {
    setAccepted(checked === true)
    if (!touched) setTouched(true)
  }

  const handleSubmit = async () => {
    setTouched(true)
    if (!accepted) return

    if (!state.formId) {
      setError('Form ID missing. Please go back and restart.')
      return
    }

    try {
      setError(null)
      await updateMutation.mutateAsync({
        projectVerificationId: state.formId,
        step: 'termsConditions',
        isTermAndConditionsAccepted: true,
      })

      acceptTerms()
      goNext()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to submit application. Please try again.'
      setError(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-giv-neutral-900">
          Terms &amp; Conditions
        </h2>
        <p className="mt-2 text-giv-neutral-600">
          Please review and accept the GIVbacks terms before submitting your
          application.
        </p>
      </div>

      {/* Terms summary */}
      <div className="rounded-xl border border-giv-neutral-200 bg-giv-neutral-50 p-5 space-y-4 max-h-72 overflow-y-auto text-sm text-giv-neutral-700 leading-relaxed">
        <p className="font-semibold text-giv-neutral-900">
          GIVbacks Eligibility Terms
        </p>
        <p>
          By applying for GIVbacks, you confirm that:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            All information provided in this application is accurate and
            truthful to the best of your knowledge.
          </li>
          <li>
            Your project is a legitimate non-profit or public-goods project that
            creates real social or environmental value.
          </li>
          <li>
            You understand that GIVbacks eligibility is granted at the
            discretion of the Giveth team and may be revoked if your project
            no longer meets the eligibility criteria.
          </li>
          <li>
            You agree to maintain transparency about how donated funds are used
            and will provide updates when requested by the Giveth team.
          </li>
          <li>
            You will not use donated funds for personal enrichment, political
            campaigns, or any activities that violate Giveth&apos;s community
            guidelines.
          </li>
          <li>
            You understand that submitting false information may result in
            permanent disqualification from GIVbacks and other Giveth programs.
          </li>
        </ul>
        <p>
          GIVbacks rewards donors with GIV tokens when they donate to verified
          projects. Project owners are responsible for maintaining their
          verification status by keeping their project information up to date.
        </p>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-4 text-sm">
        <a
          href="https://docs.giveth.io/giveconomy/givbacks"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-giv-brand-500 hover:underline"
        >
          GIVbacks documentation
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href="https://giveth.io/tos"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-giv-brand-500 hover:underline"
        >
          Full Terms of Service
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="accept-terms"
          checked={accepted}
          onCheckedChange={handleAcceptChange}
          className="mt-0.5"
        />
        <label
          htmlFor="accept-terms"
          className="text-sm text-giv-neutral-800 cursor-pointer leading-relaxed"
        >
          I have read and agree to the GIVbacks eligibility terms and conditions.
          I confirm that all information provided in this application is accurate
          and that I understand GIVbacks eligibility is subject to review by the
          Giveth team.
        </label>
      </div>
      {touched && !accepted && (
        <p className="text-sm text-red-600 -mt-2">
          You must accept the terms and conditions to submit your application.
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={goPrev}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="min-w-[140px]"
        >
          {updateMutation.isPending ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </div>
  )
}
