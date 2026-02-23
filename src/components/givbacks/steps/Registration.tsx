'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useVerificationContext } from '@/context/VerificationContext'
import { useAllowedCountries, useUpdateVerificationForm } from '@/hooks/useVerificationForm'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const registrationSchema = z
  .object({
    isNonProfitOrganization: z.boolean(),
    organizationName: z.string().optional(),
    organizationCountry: z.string().optional(),
    organizationWebsite: z
      .string()
      .url('Please enter a valid URL (e.g. https://...)')
      .optional()
      .or(z.literal('')),
    organizationDescription: z
      .string()
      .max(2000, 'Description must be at most 2000 characters')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isNonProfitOrganization) {
      if (!data.organizationName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['organizationName'],
          message: 'Organisation name is required for non-profits',
        })
      }
      if (!data.organizationCountry?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['organizationCountry'],
          message: 'Country is required for non-profits',
        })
      }
    } else {
      if (!data.organizationDescription?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['organizationDescription'],
          message: 'Please describe your organisation',
        })
      }
    }
  })

type RegistrationFormValues = z.infer<typeof registrationSchema>

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Registration() {
  const { state, slug, goPrev, goNext, updateProjectRegistry, setError } =
    useVerificationContext()
  const updateMutation = useUpdateVerificationForm(slug)
  const { data: countries, isLoading: countriesLoading } = useAllowedCountries()

  const existing = state.formData.projectRegistry

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      isNonProfitOrganization: existing?.isNonProfitOrganization ?? false,
      organizationName: existing?.organizationName ?? '',
      organizationCountry: existing?.organizationCountry ?? '',
      organizationWebsite: existing?.organizationWebsite ?? '',
      organizationDescription: existing?.organizationDescription ?? '',
    },
  })

  const isNonProfit = watch('isNonProfitOrganization')

  const onSubmit = async (values: RegistrationFormValues) => {
    if (!state.formId) {
      setError('Form ID missing. Please go back and restart.')
      return
    }

    try {
      setError(null)
      const projectRegistry = {
        isNonProfitOrganization: values.isNonProfitOrganization,
        organizationName: values.organizationName || undefined,
        organizationCountry: values.organizationCountry || undefined,
        organizationWebsite: values.organizationWebsite || undefined,
        organizationDescription: values.organizationDescription || undefined,
      }

      await updateMutation.mutateAsync({
        projectVerificationId: state.formId,
        step: 'projectRegistry',
        projectRegistry,
      })

      updateProjectRegistry(projectRegistry)
      goNext()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save registration info.'
      setError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-giv-neutral-900">
          Registration
        </h2>
        <p className="mt-2 text-giv-neutral-600">
          Tell us about your organisation&apos;s legal status.
        </p>
      </div>

      {/* Non-profit toggle */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-giv-neutral-800">
          Is your project associated with a registered non-profit organisation?{' '}
          <span className="text-red-500">*</span>
        </p>
        <div className="flex gap-4">
          {[
            { value: true, label: 'Yes, we are a non-profit' },
            { value: false, label: 'No, we are not a non-profit' },
          ].map(opt => (
            <label
              key={String(opt.value)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                value={String(opt.value)}
                {...register('isNonProfitOrganization', {
                  setValueAs: v => v === 'true',
                })}
                className="accent-giv-brand-500"
              />
              <span className="text-sm text-giv-neutral-800">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Non-profit fields */}
      {isNonProfit && (
        <div className="space-y-4 p-4 border border-giv-neutral-200 rounded-xl">
          {/* Organisation name */}
          <div>
            <label
              htmlFor="organizationName"
              className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
            >
              Organisation Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="organizationName"
              placeholder="e.g. Giveth Foundation"
              {...register('organizationName')}
              aria-invalid={!!errors.organizationName}
            />
            {errors.organizationName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.organizationName.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="organizationCountry"
              className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
            >
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="organizationCountry"
              {...register('organizationCountry')}
              disabled={countriesLoading}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              aria-invalid={!!errors.organizationCountry}
            >
              <option value="">
                {countriesLoading ? 'Loading countries...' : 'Select a country'}
              </option>
              {countries?.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.organizationCountry && (
              <p className="mt-1 text-sm text-red-600">
                {errors.organizationCountry.message}
              </p>
            )}
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="organizationWebsite"
              className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
            >
              Website Link{' '}
              <span className="text-giv-neutral-500 font-normal">
                (optional)
              </span>
            </label>
            <Input
              id="organizationWebsite"
              type="url"
              placeholder="https://yourorganisation.org"
              {...register('organizationWebsite')}
              aria-invalid={!!errors.organizationWebsite}
            />
            {errors.organizationWebsite && (
              <p className="mt-1 text-sm text-red-600">
                {errors.organizationWebsite.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Non-non-profit: description */}
      {!isNonProfit && (
        <div>
          <label
            htmlFor="organizationDescription"
            className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
          >
            Describe your organisation <span className="text-red-500">*</span>
          </label>
          <textarea
            id="organizationDescription"
            rows={5}
            placeholder="Describe the nature of your organisation, its legal structure, and how it operates..."
            {...register('organizationDescription')}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
            aria-invalid={!!errors.organizationDescription}
          />
          {errors.organizationDescription && (
            <p className="mt-1 text-sm text-red-600">
              {errors.organizationDescription.message}
            </p>
          )}
          <p className="mt-1 text-xs text-giv-neutral-500">
            {watch('organizationDescription')?.length ?? 0} / 2000 characters
          </p>
        </div>
      )}

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
