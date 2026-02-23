'use client'

import { useState } from 'react'
import { CheckCircle, Clock, FileText, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVerificationContext } from '@/context/VerificationContext'
import { useVerificationFormInit } from '@/hooks/useVerificationForm'

const REQUIREMENTS = [
  {
    icon: FileText,
    title: 'Project information',
    description:
      'Details about your project, its mission, and the impact you have made.',
  },
  {
    icon: Shield,
    title: 'Registration details',
    description:
      'If you are a non-profit, you will need your organisation name, country, and website.',
  },
  {
    icon: CheckCircle,
    title: 'Social profiles',
    description:
      'Links to your project's social media accounts (optional but recommended).',
  },
  {
    icon: Clock,
    title: 'Fund management info',
    description:
      'A description of how you manage donated funds and related wallet addresses.',
  },
]

export function BeforeStart() {
  const { slug, setForm, goNext, setLoading, setError } =
    useVerificationContext()
  const { existingForm, initForm, isCreating } = useVerificationFormInit(slug)
  const [starting, setStarting] = useState(false)

  const handleStart = async () => {
    try {
      setStarting(true)
      setError(null)
      const form = await initForm()
      setForm(form)
      goNext()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to start verification.'
      setError(msg)
    } finally {
      setStarting(false)
    }
  }

  const isLoading = starting || isCreating

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-giv-neutral-900">
          Before You Start
        </h2>
        <p className="mt-2 text-giv-neutral-600">
          You are applying for{' '}
          <span className="font-semibold text-giv-brand-500">GIVbacks</span>{' '}
          eligibility. GIVbacks rewards donors who give to verified projects on
          Giveth with GIV tokens.
        </p>
      </div>

      <div className="rounded-xl bg-giv-brand-50 border border-giv-brand-100 p-4">
        <p className="text-sm text-giv-brand-700 font-medium">
          📋 This form has 7 steps and takes approximately 15–20 minutes to
          complete. Your progress is saved after each step, so you can return
          and continue at any time.
        </p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-giv-neutral-900 mb-4">
          What you will need:
        </h3>
        <div className="space-y-4">
          {REQUIREMENTS.map(req => (
            <div key={req.title} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-giv-brand-50 flex items-center justify-center">
                <req.icon className="w-4 h-4 text-giv-brand-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-giv-neutral-900">
                  {req.title}
                </p>
                <p className="text-sm text-giv-neutral-600">
                  {req.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Note:</span> GIVbacks eligibility is
          subject to review by the Giveth team. Submitting this form does not
          guarantee approval. Projects must meet Giveth&apos;s{' '}
          <a
            href="https://docs.giveth.io/giveconomy/givbacks"
            target="_blank"
            rel="noreferrer"
            className="underline font-medium"
          >
            GIVbacks eligibility criteria
          </a>
          .
        </p>
      </div>

      {existingForm && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800 font-medium">
            ✅ You have a saved application in progress. Clicking &ldquo;Start
            Application&rdquo; will resume where you left off.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          onClick={handleStart}
          disabled={isLoading}
          className="min-w-[160px]"
        >
          {isLoading ? 'Starting...' : existingForm ? 'Continue Application' : 'Start Application'}
        </Button>
      </div>
    </div>
  )
}
