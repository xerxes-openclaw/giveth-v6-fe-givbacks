'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useVerificationContext } from '@/context/VerificationContext'
import { useUpdateVerificationForm } from '@/hooks/useVerificationForm'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const impactSchema = z.object({
  problem: z
    .string()
    .min(50, 'Please describe the problem in at least 50 characters')
    .max(3000, 'Maximum 3000 characters'),
  mission: z
    .string()
    .min(50, 'Please describe your mission in at least 50 characters')
    .max(3000, 'Maximum 3000 characters'),
  foundationDate: z
    .string()
    .min(1, 'Foundation date is required')
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Please enter a valid date',
    }),
  achievedMilestones: z
    .string()
    .min(50, 'Please describe your milestones in at least 50 characters')
    .max(3000, 'Maximum 3000 characters'),
  impact: z
    .string()
    .min(50, 'Please describe your impact in at least 50 characters')
    .max(3000, 'Maximum 3000 characters'),
  plans: z
    .string()
    .min(50, 'Please describe your plans in at least 50 characters')
    .max(3000, 'Maximum 3000 characters'),
})

type ImpactFormValues = z.infer<typeof impactSchema>

// ---------------------------------------------------------------------------
// Textarea component
// ---------------------------------------------------------------------------
function TextArea({
  id,
  label,
  required,
  placeholder,
  hint,
  maxLength,
  currentLength,
  error,
  rows = 4,
  ...props
}: {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  hint?: string
  maxLength?: number
  currentLength?: number
  error?: string
  rows?: number
} & React.ComponentProps<'textarea'>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
      >
        {label}{' '}
        {required && <span className="text-red-500">*</span>}
      </label>
      {hint && (
        <p className="text-xs text-giv-neutral-500 mb-1.5">{hint}</p>
      )}
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none aria-invalid:border-red-500"
        aria-invalid={!!error}
        {...props}
      />
      <div className="flex justify-between mt-1">
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <span />
        )}
        {maxLength !== undefined && currentLength !== undefined && (
          <p className="text-xs text-giv-neutral-400">
            {currentLength} / {maxLength}
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ImpactMilestones() {
  const { state, slug, goPrev, goNext, updateMilestones, setError } =
    useVerificationContext()
  const updateMutation = useUpdateVerificationForm(slug)

  const existing = state.formData.milestones

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ImpactFormValues>({
    resolver: zodResolver(impactSchema),
    defaultValues: {
      problem: existing?.problem ?? '',
      mission: existing?.mission ?? '',
      foundationDate: existing?.foundationDate
        ? existing.foundationDate.slice(0, 10) // ISO date → YYYY-MM-DD
        : '',
      achievedMilestones: existing?.achievedMilestones ?? '',
      impact: existing?.impact ?? '',
      plans: existing?.plans ?? '',
    },
  })

  const values = watch()

  const onSubmit = async (data: ImpactFormValues) => {
    if (!state.formId) {
      setError('Form ID missing. Please go back and restart.')
      return
    }

    try {
      setError(null)
      const milestones = {
        problem: data.problem,
        mission: data.mission,
        foundationDate: data.foundationDate,
        achievedMilestones: data.achievedMilestones,
        impact: data.impact,
        plans: data.plans,
      }

      await updateMutation.mutateAsync({
        projectVerificationId: state.formId,
        step: 'impactMilestones',
        milestones,
      })

      updateMilestones(milestones)
      goNext()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save impact info.'
      setError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-giv-neutral-900">
          Impact &amp; Milestones
        </h2>
        <p className="mt-2 text-giv-neutral-600">
          Help us understand your project&apos;s goals, what you have achieved,
          and your plans for the future.
        </p>
      </div>

      {/* Problem */}
      <TextArea
        id="problem"
        label="What problem are you solving?"
        required
        placeholder="Describe the problem your project addresses..."
        hint="Be specific about the issue you are tackling and who it affects."
        maxLength={3000}
        currentLength={values.problem?.length ?? 0}
        error={errors.problem?.message}
        {...register('problem')}
      />

      {/* Mission */}
      <TextArea
        id="mission"
        label="What is your mission?"
        required
        placeholder="Describe your project's mission and vision..."
        hint="What are you trying to achieve in the long run?"
        maxLength={3000}
        currentLength={values.mission?.length ?? 0}
        error={errors.mission?.message}
        {...register('mission')}
      />

      {/* Foundation Date */}
      <div>
        <label
          htmlFor="foundationDate"
          className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
        >
          When was your project founded? <span className="text-red-500">*</span>
        </label>
        <Input
          id="foundationDate"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          {...register('foundationDate')}
          aria-invalid={!!errors.foundationDate}
          className="w-48"
        />
        {errors.foundationDate && (
          <p className="mt-1 text-sm text-red-600">
            {errors.foundationDate.message}
          </p>
        )}
      </div>

      {/* Achieved Milestones */}
      <TextArea
        id="achievedMilestones"
        label="What milestones have you achieved?"
        required
        placeholder="Describe key milestones and achievements to date..."
        hint="Include concrete results, numbers, and impact metrics where possible."
        maxLength={3000}
        currentLength={values.achievedMilestones?.length ?? 0}
        error={errors.achievedMilestones?.message}
        {...register('achievedMilestones')}
      />

      {/* Impact */}
      <TextArea
        id="impact"
        label="What impact have you had?"
        required
        placeholder="Describe the tangible impact your project has made..."
        hint="How many people/communities have you helped? What changed because of your work?"
        maxLength={3000}
        currentLength={values.impact?.length ?? 0}
        error={errors.impact?.message}
        {...register('impact')}
      />

      {/* Plans */}
      <TextArea
        id="plans"
        label="What are your future plans?"
        required
        placeholder="Describe your roadmap and upcoming goals..."
        hint="Where is this project headed? What will the donated funds enable?"
        maxLength={3000}
        currentLength={values.plans?.length ?? 0}
        error={errors.plans?.message}
        {...register('plans')}
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={goPrev}>
          Back
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || updateMutation.isPending}
        >
          {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </form>
  )
}
