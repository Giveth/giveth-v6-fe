'use client'

import { useEffect, useState } from 'react'
import type { MilestonesEntity } from '@/lib/graphql/generated/graphql'
import { FormField, textareaClass } from './FormField'
import { StepFooter } from './StepFooter'
import { UrlListInput } from './UrlListInput'

export function Step4Milestones({
  data,
  onSave,
  onNext,
  onBack,
  isLoading,
}: {
  data?: MilestonesEntity | null
  onSave: (data: {
    foundationDate: string
    mission: string
    achievedMilestones: string
    achievedMilestonesProofs: string[]
    problem: string
    plans: string
    impact: string
  }) => Promise<void>
  onNext: () => void
  onBack: () => void
  isLoading: boolean
}) {
  const [foundationDate, setFoundationDate] = useState('')
  const [mission, setMission] = useState('')
  const [achievedMilestones, setAchievedMilestones] = useState('')
  const [achievedMilestonesProofs, setAchievedMilestonesProofs] = useState<string[]>([])
  const [problem, setProblem] = useState('')
  const [plans, setPlans] = useState('')
  const [impact, setImpact] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFoundationDate(data?.foundationDate ?? '')
    setMission(data?.mission ?? '')
    setAchievedMilestones(data?.achievedMilestones ?? '')
    setAchievedMilestonesProofs(data?.achievedMilestonesProofs ?? [])
    setProblem(data?.problem ?? '')
    setPlans(data?.plans ?? '')
    setImpact(data?.impact ?? '')
  }, [data])

  const handleNext = async () => {
    if (!mission.trim()) {
      setErrors({ mission: 'Mission is required' })
      return
    }

    try {
      await onSave({
        foundationDate,
        mission: mission.trim(),
        achievedMilestones: achievedMilestones.trim(),
        achievedMilestonesProofs,
        problem: problem.trim(),
        plans: plans.trim(),
        impact: impact.trim(),
      })
      onNext()
    } catch {
      setErrors({ submit: 'Failed to save. Please try again.' })
    }
  }

  return (
    <div className="space-y-5">
      <FormField label="Foundation Date">
        <input
          type="date"
          value={foundationDate}
          onChange={e => setFoundationDate(e.target.value)}
          className="w-full rounded-xl border border-giv-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500"
        />
      </FormField>

      <FormField label="Mission" required error={errors.mission}>
        <textarea
          rows={3}
          value={mission}
          onChange={e => setMission(e.target.value)}
          className={textareaClass}
          placeholder="What is your project's mission?"
        />
      </FormField>

      <FormField label="Problem Being Solved">
        <textarea
          rows={3}
          value={problem}
          onChange={e => setProblem(e.target.value)}
          className={textareaClass}
          placeholder="What problem does your project address?"
        />
      </FormField>

      <FormField label="Achieved Milestones">
        <textarea
          rows={3}
          value={achievedMilestones}
          onChange={e => setAchievedMilestones(e.target.value)}
          className={textareaClass}
          placeholder="Describe key milestones you have already reached"
        />
      </FormField>

      <UrlListInput
        label="Milestone Proof Links (URLs)"
        hint="Links to reports, posts, docs, or other proof."
        value={achievedMilestonesProofs}
        onChange={setAchievedMilestonesProofs}
      />

      <FormField label="Plans">
        <textarea
          rows={3}
          value={plans}
          onChange={e => setPlans(e.target.value)}
          className={textareaClass}
          placeholder="What are your plans going forward?"
        />
      </FormField>

      <FormField label="Impact">
        <textarea
          rows={3}
          value={impact}
          onChange={e => setImpact(e.target.value)}
          className={textareaClass}
          placeholder="How does your project create impact?"
        />
      </FormField>

      {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
      <StepFooter onBack={onBack} onNext={handleNext} isLoading={isLoading} />
    </div>
  )
}
