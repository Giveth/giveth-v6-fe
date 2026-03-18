'use client'

import { useEffect, useRef, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Dialog } from '@radix-ui/themes'
import { CheckCircle2 } from 'lucide-react'
import { useSiweAuth } from '@/context/AuthContext'
import {
  useCreateGivbacksEligibilityForm,
  useCurrentGivbacksEligibilityForm,
  useSendGivbacksEmailConfirmation,
  useUpdateGivbacksEligibilityForm,
} from '@/hooks/useGivbacksEligibility'
import type { GivbacksEligibilityFormEntity } from '@/lib/graphql/generated/graphql'
import { GivbacksStepIndicator } from './GivbacksStepIndicator'
import { Step1PersonalInfo } from './steps/Step1PersonalInfo'
import { Step2ProjectRegistry } from './steps/Step2ProjectRegistry'
import { Step3ProjectContacts } from './steps/Step3ProjectContacts'
import { Step4Milestones } from './steps/Step4Milestones'
import { Step5ManagingFunds } from './steps/Step5ManagingFunds'
import { Step6TermsAndConditions } from './steps/Step6TermsAndConditions'

const STEP_KEYS: Record<number, string> = {
  1: 'personalInfo',
  2: 'projectRegistry',
  3: 'projectContacts',
  4: 'milestones',
  5: 'managingFunds',
  6: 'termsAndConditions',
}

function getStepFromLastStep(lastStep?: string | null) {
  const match = Object.entries(STEP_KEYS).find(([, key]) => key === lastStep)
  return match ? Math.min(Number(match[0]) + 1, 6) : 1
}

export function GivbacksApplicationModal({
  slug,
  open,
  onOpenChange,
}: {
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { walletAddress } = useSiweAuth()
  const [step, setStep] = useState(1)
  const [formId, setFormId] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: existingFormData, isLoading: isLoadingForm } =
    useCurrentGivbacksEligibilityForm(open ? slug : undefined)
  const createForm = useCreateGivbacksEligibilityForm()
  const updateForm = useUpdateGivbacksEligibilityForm()
  const sendConfirmation = useSendGivbacksEmailConfirmation()

  const form: GivbacksEligibilityFormEntity | null =
    existingFormData?.getCurrentGivbacksEligibilityForm ?? null

  useEffect(() => {
    if (!open) {
      setStep(1)
      setFormId(null)
      setSubmitted(false)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [open])

  useEffect(() => {
    if (!open || isLoadingForm) return

    if (form) {
      setFormId(form.id)
      if (form.status === 'SUBMITTED' || form.status === 'VERIFIED') {
        setSubmitted(true)
      } else {
        setStep(getStepFromLastStep(form.lastStep))
      }
      return
    }

    if (!formId && !createForm.isPending) {
      createForm.mutate(slug, {
        onSuccess: data => {
          setFormId(data.createGivbacksEligibilityForm.id)
        },
      })
    }
  }, [open, isLoadingForm, form, formId, createForm, slug])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const isMutating =
    createForm.isPending || updateForm.isPending || sendConfirmation.isPending

  const save = async (stepData: Record<string, unknown>, lastStep: string) => {
    if (!formId) throw new Error('Missing form id')

    await updateForm.mutateAsync({
      givbacksEligibilityId: formId,
      lastStep,
      ...stepData,
    })
  }

  const handleSubmit = async () => {
    if (!formId) throw new Error('Missing form id')
    await sendConfirmation.mutateAsync(formId)
    setSubmitted(true)
    timerRef.current = setTimeout(() => onOpenChange(false), 4000)
  }

  const renderStep = () => {
    if (isLoadingForm || createForm.isPending) {
      return (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-giv-brand-500 border-t-transparent" />
        </div>
      )
    }

    if (submitted) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-giv-brand-500" />
          <h3 className="text-xl font-bold text-giv-neutral-900">Application Submitted!</h3>
          <p className="max-w-xs text-sm text-giv-neutral-600">
            Check your email to confirm the address you entered. The Giveth team can review your
            application after that.
          </p>
        </div>
      )
    }

    switch (step) {
      case 1:
        return (
          <Step1PersonalInfo
            data={form?.personalInfo}
            walletAddress={walletAddress}
            onSave={data => save({ personalInfo: data }, STEP_KEYS[1])}
            onNext={() => setStep(2)}
            isLoading={isMutating}
          />
        )
      case 2:
        return (
          <Step2ProjectRegistry
            data={form?.projectRegistry}
            onSave={data => save({ projectRegistry: data }, STEP_KEYS[2])}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
            isLoading={isMutating}
          />
        )
      case 3:
        return (
          <Step3ProjectContacts
            data={form?.projectContacts}
            onSave={projectContacts => save({ projectContacts }, STEP_KEYS[3])}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
            isLoading={isMutating}
          />
        )
      case 4:
        return (
          <Step4Milestones
            data={form?.milestones}
            onSave={milestones => save({ milestones }, STEP_KEYS[4])}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
            isLoading={isMutating}
          />
        )
      case 5:
        return (
          <Step5ManagingFunds
            data={form?.managingFunds}
            onSave={managingFunds => save({ managingFunds }, STEP_KEYS[5])}
            onNext={() => setStep(6)}
            onBack={() => setStep(4)}
            isLoading={isMutating}
          />
        )
      case 6:
        return (
          <Step6TermsAndConditions
            accepted={form?.isTermAndConditionsAccepted ?? false}
            onSave={isTermAndConditionsAccepted =>
              save({ isTermAndConditionsAccepted }, STEP_KEYS[6])
            }
            onSubmit={handleSubmit}
            onBack={() => setStep(5)}
            isLoading={isMutating}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="3" className="w-[95vw] max-w-[680px] rounded-3xl">
        <Dialog.Title className="sr-only">Apply for GIVbacks</Dialog.Title>
        <Dialog.Description className="sr-only">
          Complete the GIVbacks eligibility application for this project.
        </Dialog.Description>

        <div className="px-6 py-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-giv-neutral-900">Apply for GIVbacks</h2>
              {!submitted && (
                <p className="mt-0.5 text-xs text-giv-neutral-500">
                  Step {step} of 6 — your progress is saved automatically.
                </p>
              )}
            </div>
            <Dialog.Close>
              <button
                type="button"
                aria-label="Close"
                className="cursor-pointer rounded-full p-2 transition-colors hover:bg-black/5"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </div>

          {!submitted && !isLoadingForm && !createForm.isPending && (
            <GivbacksStepIndicator currentStep={step} />
          )}

          {renderStep()}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
