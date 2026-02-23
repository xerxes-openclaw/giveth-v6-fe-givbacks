'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { type Route } from 'next'
import { Loader2 } from 'lucide-react'
import { GivbacksApplicationForm } from '@/components/givbacks/GivbacksApplicationForm'
import { VerificationProvider } from '@/context/VerificationContext'
import { useSiweAuth } from '@/context/AuthContext'
import { useProjectBySlug } from '@/hooks/useProject'

/**
 * GIVbacks verification form page.
 *
 * Access control:
 * 1. Must be authenticated (SIWE).
 * 2. Must be the project owner (wallet address matches adminUser.wallets[0].address).
 *
 * If either check fails the user is redirected to the project page.
 */
export default function GivbacksPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { isAuthenticated, walletAddress, isLoading: isAuthLoading } = useSiweAuth()
  const { data: projectData, isLoading: isProjectLoading } = useProjectBySlug(slug)

  const project = projectData?.projectBySlug
  const ownerAddress = project?.adminUser?.wallets?.[0]?.address

  // Determine if the current user is the project owner
  const isOwner =
    !!walletAddress &&
    !!ownerAddress &&
    walletAddress.toLowerCase() === ownerAddress.toLowerCase()

  useEffect(() => {
    // Wait until auth and project data are resolved before making access decisions
    if (isAuthLoading || isProjectLoading) return

    // Not authenticated → redirect to project page
    if (!isAuthenticated) {
      router.replace(`/project/${slug}` as Route)
      return
    }

    // Project loaded but user is not the owner → redirect to project page
    if (project && !isOwner) {
      router.replace(`/project/${slug}` as Route)
    }
  }, [isAuthLoading, isProjectLoading, isAuthenticated, project, isOwner, router, slug])

  // ---------------------------------------------------------------------------
  // Loading states
  // ---------------------------------------------------------------------------
  if (isAuthLoading || isProjectLoading) {
    return (
      <div className="min-h-screen bg-giv-neutral-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-giv-brand-500" />
      </div>
    )
  }

  // Project not found
  if (!project) {
    return (
      <div className="min-h-screen bg-giv-neutral-200 flex items-center justify-center">
        <p className="text-giv-neutral-700">Project not found.</p>
      </div>
    )
  }

  // Access denied (render nothing while redirect happens)
  if (!isAuthenticated || !isOwner) {
    return null
  }

  // ---------------------------------------------------------------------------
  // Render form
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-giv-neutral-200 py-8">
      <VerificationProvider slug={slug}>
        <GivbacksApplicationForm />
      </VerificationProvider>
    </div>
  )
}
