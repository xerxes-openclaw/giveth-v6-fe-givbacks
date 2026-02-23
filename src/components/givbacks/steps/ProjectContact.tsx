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
const contactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  url: z
    .string()
    .min(1, 'URL or handle is required'),
})

const schema = z.object({
  projectContacts: z
    .array(contactSchema)
    .min(1, 'Please add at least one project contact'),
})

type FormValues = z.infer<typeof schema>

// Common contact types
const CONTACT_SUGGESTIONS = [
  'Email',
  'Telegram',
  'Discord',
  'Twitter / X',
  'Website',
  'GitHub',
  'Forum',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ProjectContact() {
  const { state, slug, goPrev, goNext, updateProjectContacts, setError } =
    useVerificationContext()
  const updateMutation = useUpdateVerificationForm(slug)

  const existing = state.formData.projectContacts ?? []

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectContacts:
        existing.length > 0
          ? existing.map(c => ({ name: c.name, url: c.url }))
          : [{ name: '', url: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projectContacts',
  })

  const onSubmit = async (values: FormValues) => {
    if (!state.formId) {
      setError('Form ID missing. Please go back and restart.')
      return
    }

    try {
      setError(null)
      await updateMutation.mutateAsync({
        projectVerificationId: state.formId,
        step: 'projectContacts',
        projectContacts: values.projectContacts,
      })

      updateProjectContacts(values.projectContacts)
      goNext()
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to save project contacts.'
      setError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-giv-neutral-900">
          Project Contact
        </h2>
        <p className="mt-2 text-giv-neutral-600">
          How can the Giveth team reach you about your project? Please provide
          at least one contact method.
        </p>
      </div>

      {/* Contact suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-giv-neutral-500 self-center">
          Quick add:
        </span>
        {CONTACT_SUGGESTIONS.map(suggestion => (
          <button
            key={suggestion}
            type="button"
            onClick={() => append({ name: suggestion, url: '' })}
            className="text-xs px-2 py-1 rounded-md border border-giv-neutral-200 hover:border-giv-brand-300 hover:text-giv-brand-500 transition-colors"
          >
            + {suggestion}
          </button>
        ))}
      </div>

      {/* Contact fields */}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-start gap-3 p-4 border border-giv-neutral-200 rounded-xl"
          >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-giv-neutral-700 mb-1">
                  Contact Type
                </label>
                <Input
                  placeholder="e.g. Email, Telegram"
                  {...register(`projectContacts.${index}.name`)}
                  aria-invalid={!!errors.projectContacts?.[index]?.name}
                />
                {errors.projectContacts?.[index]?.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.projectContacts[index].name?.message}
                  </p>
                )}
              </div>

              {/* URL/Handle */}
              <div>
                <label className="block text-xs font-medium text-giv-neutral-700 mb-1">
                  URL or handle
                </label>
                <Input
                  placeholder="https://... or @username"
                  {...register(`projectContacts.${index}.url`)}
                  aria-invalid={!!errors.projectContacts?.[index]?.url}
                />
                {errors.projectContacts?.[index]?.url && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.projectContacts[index].url?.message}
                  </p>
                )}
              </div>
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              className="mt-5 text-giv-neutral-400 hover:text-red-500 transition-colors disabled:opacity-30"
              aria-label="Remove contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Root error */}
        {errors.projectContacts?.root && (
          <p className="text-sm text-red-600">
            {errors.projectContacts.root.message}
          </p>
        )}

        <button
          type="button"
          onClick={() => append({ name: '', url: '' })}
          className="flex items-center gap-2 text-sm text-giv-brand-500 hover:text-giv-brand-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add another contact
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
