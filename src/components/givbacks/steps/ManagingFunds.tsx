'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useVerificationContext } from '@/context/VerificationContext'
import { useUpdateVerificationForm } from '@/hooks/useVerificationForm'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const addressSchema = z.object({
  address: z
    .string()
    .min(1, 'Wallet address is required')
    .regex(/^0x[0-9a-fA-F]{40}$|^[1-9A-HJ-NP-Za-km-z]{32,44}$/, {
      message: 'Please enter a valid EVM or Solana address',
    }),
  title: z.string().min(1, 'A label for this address is required'),
  networkId: z.coerce
    .number({ invalid_type_error: 'Network ID must be a number' })
    .int()
    .nonnegative('Network ID must be 0 or greater'),
  chainType: z.string().optional(),
})

const managingFundsSchema = z.object({
  description: z
    .string()
    .min(50, 'Please describe fund management in at least 50 characters')
    .max(3000, 'Maximum 3000 characters'),
  relatedAddresses: z.array(addressSchema),
})

type ManagingFundsFormValues = z.infer<typeof managingFundsSchema>

// Common EVM network IDs for the quick-select
const COMMON_NETWORKS = [
  { id: 1, name: 'Ethereum Mainnet' },
  { id: 100, name: 'Gnosis Chain' },
  { id: 137, name: 'Polygon' },
  { id: 10, name: 'Optimism' },
  { id: 42161, name: 'Arbitrum' },
  { id: 8453, name: 'Base' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ManagingFunds() {
  const { state, slug, goPrev, goNext, updateManagingFunds, setError } =
    useVerificationContext()
  const updateMutation = useUpdateVerificationForm(slug)

  const existing = state.formData.managingFunds

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ManagingFundsFormValues>({
    resolver: zodResolver(managingFundsSchema),
    defaultValues: {
      description: existing?.description ?? '',
      relatedAddresses:
        existing?.relatedAddresses?.map(a => ({
          address: a.address,
          title: a.title ?? '',
          networkId: a.networkId ?? 1,
          chainType: a.chainType ?? 'EVM',
        })) ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'relatedAddresses',
  })

  const descriptionValue = watch('description')

  const onSubmit = async (values: ManagingFundsFormValues) => {
    if (!state.formId) {
      setError('Form ID missing. Please go back and restart.')
      return
    }

    try {
      setError(null)
      const managingFunds = {
        description: values.description,
        relatedAddresses: values.relatedAddresses.map(a => ({
          address: a.address,
          title: a.title,
          networkId: a.networkId,
          chainType: a.chainType || 'EVM',
        })),
      }

      await updateMutation.mutateAsync({
        projectVerificationId: state.formId,
        step: 'managingFunds',
        managingFunds,
      })

      updateManagingFunds(managingFunds)
      goNext()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save fund management info.'
      setError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-giv-neutral-900">
          Managing Funds
        </h2>
        <p className="mt-2 text-giv-neutral-600">
          Tell us how you manage funds received via Giveth.
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-giv-neutral-800 mb-1.5"
        >
          How do you manage donated funds?{' '}
          <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-giv-neutral-500 mb-1.5">
          Describe your decision-making process, governance structure, and how
          funds are allocated. Include any multi-sig setups or on-chain governance.
        </p>
        <textarea
          id="description"
          rows={6}
          placeholder="Describe your fund management process, who has access to the funds, how spending decisions are made..."
          {...register('description')}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none aria-invalid:border-red-500"
          aria-invalid={!!errors.description}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-xs text-red-600">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-giv-neutral-400">
            {descriptionValue?.length ?? 0} / 3000
          </p>
        </div>
      </div>

      {/* Related addresses */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-giv-neutral-800">
            Related Wallet Addresses{' '}
            <span className="text-giv-neutral-500 font-normal">(optional)</span>
          </h3>
          <p className="text-xs text-giv-neutral-500 mt-0.5">
            Add any wallet addresses that receive or manage funds for your project.
          </p>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border border-giv-neutral-200 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-giv-neutral-600">
                Address #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-giv-neutral-400 hover:text-red-500 transition-colors"
                aria-label="Remove address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Label */}
              <div>
                <label className="block text-xs font-medium text-giv-neutral-700 mb-1">
                  Label
                </label>
                <Input
                  placeholder="e.g. Treasury Multi-sig"
                  {...register(`relatedAddresses.${index}.title`)}
                  aria-invalid={!!errors.relatedAddresses?.[index]?.title}
                />
                {errors.relatedAddresses?.[index]?.title && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.relatedAddresses[index].title?.message}
                  </p>
                )}
              </div>

              {/* Network */}
              <div>
                <label className="block text-xs font-medium text-giv-neutral-700 mb-1">
                  Network
                </label>
                <select
                  {...register(`relatedAddresses.${index}.networkId`, {
                    valueAsNumber: true,
                  })}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  {COMMON_NETWORKS.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.id})
                    </option>
                  ))}
                  <option value={0}>Other (specify ID below)</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-giv-neutral-700 mb-1">
                Wallet Address
              </label>
              <Input
                placeholder="0x... or Solana address"
                {...register(`relatedAddresses.${index}.address`)}
                aria-invalid={!!errors.relatedAddresses?.[index]?.address}
              />
              {errors.relatedAddresses?.[index]?.address && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.relatedAddresses[index].address?.message}
                </p>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            append({ address: '', title: '', networkId: 1, chainType: 'EVM' })
          }
          className="flex items-center gap-2 text-sm text-giv-brand-500 hover:text-giv-brand-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add wallet address
        </button>
      </div>

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
