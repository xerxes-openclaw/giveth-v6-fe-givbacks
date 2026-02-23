'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useVerificationContext } from '@/context/VerificationContext'
import { useUpdateVerificationForm } from '@/hooks/useVerificationForm'
import { useSiweAuth } from '@/context/AuthContext'
import type { PersonalInfo as PersonalInfoType } from '@/lib/types/verification'

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const personalInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  walletAddress: z.string().min(1, 'Wallet address is required'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
})

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PersonalInfo() {
  const { state, slug, goPrev, goNext, updatePersonalInfo, setError } =
    useVerificationContext()
  const { walletAddress, user } = useSiweAuth()
  const updateMutation = useUpdateVerificationForm(slug)

  const existingInfo = state.formData.personalInfo

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: existingInfo?.fullName ?? '',
      walletAddress: walletAddress ?? existingInfo?.walletAddress ?? '',
      email: existingInfo?.email ?? user?.email ?? '',
    },
  })

  // Update defaults when wallet connects
  useEffect(() => {
    reset({
      fullName: existingInfo?.fullName ?? '',
      walletAddress: walletAddress ?? existingInfo?.walletAddress ?? '',
      email: existingInfo?.email ?? user?.email ?? '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, user?.email])

  const onSubmit = async (values: PersonalInfoFormValues) => {
    if (!state.formId) {
      setError('Form ID missing. Please go back and restart.')
      return
    }

    try {
      setError(null)
      const personalInfo: PersonalInfoType = {
        fullName: values.fullName,
        walletAddress: values.walletAddress,
        email: values.email || undefined,
      }

      await updateMutation.mutateAsync({
        projectVerificationId: state.formId,
        step: 'personalInfo',
        personalInfo,
      })

      updatePersonalInfo(personalInfo)
      goNext()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save personal info.'
      setError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-giv-neutral-900">
          Personal Info
        </h2>
        <p className="mt-2 text-giv-neutral-600">
          These details are pre-filled from your connected wallet and Giveth
          profile.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="fullName"
          placeholder="Your full name"
          {...register('fullName')}
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
        )}
      </div>

      {/* Wallet Address (read-only) */}
      <div>
        <label
          htmlFor="walletAddress"
          className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
        >
          Wallet Address
        </label>
        <Input
          id="walletAddress"
          readOnly
          disabled
          {...register('walletAddress')}
          className="bg-giv-neutral-100 cursor-not-allowed text-giv-neutral-600"
        />
        <p className="mt-1 text-xs text-giv-neutral-500">
          This is your connected wallet address and cannot be changed here.
        </p>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
        >
          Email Address{' '}
          <span className="text-giv-neutral-500 font-normal">(optional)</span>
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
        <p className="mt-1 text-xs text-giv-neutral-500">
          We may use this to contact you about your application.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={goPrev}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
          {isSubmitting || updateMutation.isPending ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </form>
  )
}
