'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useVerificationContext } from '@/context/VerificationContext'
import { useUpdateVerificationForm } from '@/hooks/useVerificationForm'
import type { SocialNetwork } from '@/lib/types/verification'

const SOCIAL_NETWORKS: { value: SocialNetwork; label: string }[] = [
  { value: 'TWITTER', label: 'Twitter / X' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'REDDIT', label: 'Reddit' },
  { value: 'DISCORD', label: 'Discord' },
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'FARCASTER', label: 'Farcaster' },
]

const socialProfileSchema = z.object({
  socialNetwork: z.string().min(1, 'Please select a network'),
  socialNetworkId: z
    .string()
    .min(1, 'Please enter your username or profile URL'),
})

const schema = z.object({
  socialProfiles: z.array(socialProfileSchema),
})

type FormValues = z.infer<typeof schema>

export function SocialProfiles() {
  const { state, slug, goPrev, goNext, updateSocialProfiles, setError } =
    useVerificationContext()
  const updateMutation = useUpdateVerificationForm(slug)

  const existingProfiles = state.formData.socialProfiles ?? []

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      socialProfiles:
        existingProfiles.length > 0
          ? existingProfiles.map(p => ({
              socialNetwork: p.socialNetwork,
              socialNetworkId: p.socialNetworkId ?? '',
            }))
          : [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socialProfiles',
  })

  const onSubmit = async (values: FormValues) => {
    if (!state.formId) {
      setError('Form ID missing. Please go back and restart.')
      return
    }

    try {
      setError(null)
      const socialProfiles = values.socialProfiles.map(p => ({
        socialNetwork: p.socialNetwork as SocialNetwork,
        socialNetworkId: p.socialNetworkId,
      }))

      await updateMutation.mutateAsync({
        projectVerificationId: state.formId,
        step: 'socialProfiles',
        socialProfiles,
      })

      updateSocialProfiles(
        socialProfiles.map(p => ({ socialNetwork: p.socialNetwork as SocialNetwork, socialNetworkId: p.socialNetworkId })),
      )
      goNext()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save social profiles.'
      setError(msg)
    }
  }

  // Skip is allowed for this step
  const handleSkip = async () => {
    if (!state.formId) return
    try {
      setError(null)
      await updateMutation.mutateAsync({
        projectVerificationId: state.formId,
        step: 'socialProfiles',
        socialProfiles: [],
      })
      updateSocialProfiles([])
      goNext()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to skip step.'
      setError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-giv-neutral-900">
          Social Profiles
        </h2>
        <p className="mt-2 text-giv-neutral-600">
          Add your project&apos;s social media profiles. This step is optional
          but helps us verify your project&apos;s online presence.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-start gap-3 p-4 border border-giv-neutral-200 rounded-xl"
          >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Network select */}
              <div>
                <label className="block text-xs font-medium text-giv-neutral-700 mb-1">
                  Network
                </label>
                <select
                  {...register(`socialProfiles.${index}.socialNetwork`)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="">Select network</option>
                  {SOCIAL_NETWORKS.map(n => (
                    <option key={n.value} value={n.value}>
                      {n.label}
                    </option>
                  ))}
                </select>
                {errors.socialProfiles?.[index]?.socialNetwork && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.socialProfiles[index].socialNetwork?.message}
                  </p>
                )}
              </div>

              {/* Username/URL */}
              <div>
                <label className="block text-xs font-medium text-giv-neutral-700 mb-1">
                  Username or profile URL
                </label>
                <Input
                  placeholder="@username or https://..."
                  {...register(`socialProfiles.${index}.socialNetworkId`)}
                  aria-invalid={
                    !!errors.socialProfiles?.[index]?.socialNetworkId
                  }
                />
                {errors.socialProfiles?.[index]?.socialNetworkId && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.socialProfiles[index].socialNetworkId?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-5 text-giv-neutral-500 hover:text-red-500 transition-colors"
              aria-label="Remove social profile"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add button */}
        <button
          type="button"
          onClick={() =>
            append({ socialNetwork: '', socialNetworkId: '' })
          }
          className="flex items-center gap-2 text-sm text-giv-brand-500 hover:text-giv-brand-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add social profile
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={goPrev}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            disabled={updateMutation.isPending}
          >
            Skip
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending}
          >
            {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Next'}
          </Button>
        </div>
      </div>
    </form>
  )
}
