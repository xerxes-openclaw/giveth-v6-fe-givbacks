'use client'

import Link from 'next/link'
import { type Route } from 'next'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVerificationContext } from '@/context/VerificationContext'

export function Done() {
  const { state, slug } = useVerificationContext()
  const projectTitle = state.formData.project?.title ?? 'your project'

  return (
    <div className="text-center space-y-6 py-4">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-giv-neutral-900">
          Application Submitted! 🎉
        </h2>
        <p className="mt-3 text-giv-neutral-600 max-w-md mx-auto">
          Your GIVbacks verification application for{' '}
          <span className="font-semibold text-giv-neutral-900">
            {projectTitle}
          </span>{' '}
          has been submitted successfully.
        </p>
      </div>

      {/* What happens next */}
      <div className="text-left rounded-xl border border-giv-neutral-200 bg-giv-neutral-50 p-5 space-y-3 max-w-md mx-auto">
        <h3 className="text-sm font-semibold text-giv-neutral-900">
          What happens next?
        </h3>
        <ul className="space-y-2 text-sm text-giv-neutral-700">
          <li className="flex items-start gap-2">
            <span className="text-giv-brand-500 font-bold mt-0.5">1.</span>
            <span>
              The Giveth team will review your application. This typically takes
              1–2 weeks.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-giv-brand-500 font-bold mt-0.5">2.</span>
            <span>
              You may be contacted for additional information or clarification.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-giv-brand-500 font-bold mt-0.5">3.</span>
            <span>
              Once approved, your project will display the GIVbacks badge and
              donors will start earning GIV tokens when they donate.
            </span>
          </li>
        </ul>
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 max-w-md mx-auto text-left">
        <p>
          <span className="font-semibold">Tip:</span> Keep your project
          information up to date! Projects with detailed, regularly updated
          information are more likely to be approved.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button asChild>
          <Link href={`/project/${slug}` as Route}>Back to Project</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account">Go to My Projects</Link>
        </Button>
      </div>
    </div>
  )
}
