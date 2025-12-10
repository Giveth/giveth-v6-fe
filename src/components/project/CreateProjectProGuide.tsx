import type { CreateFormSection } from './CreateProjectFullForm'

type TipContent = {
  title: string
  body: string[]
}

const TIP_CONTENT: Record<CreateFormSection, TipContent> = {
  default: {
    title: 'Tips to make a great project',
    body: [
      'As you go through each section, fill in as much detail as you can.',
      'You get what you put in: quality info builds trust with donors.',
      'Need more guidance? Review the onboarding tutorials for project owners.',
      'Add a banner image and at least one social link for quick credibility.',
    ],
  },
  name: {
    title: 'A captivating title',
    body: [
      'Aim for fewer than 10 words.',
      'Highlight the outcome or benefit, not just the activity.',
      'Avoid jargon so newcomers understand quickly.',
    ],
  },
  description: {
    title: 'Describe your project',
    body: [
      'Share the problem, your solution, and who benefits.',
      'Outline milestones or near-term goals the reader can track.',
      'Invite supporters to follow your updates or get involved.',
    ],
  },
  social: {
    title: 'Get connected',
    body: [
      'Add at least one verified profile.',
      'Use official handles that match your project name.',
      'Link a website or community chat for quick trust.',
    ],
  },
  categories: {
    title: 'Choose the right category',
    body: [
      'Pick the themes that best describe your work.',
      'You can choose up to three categories.',
      'If you’re unsure, pick the primary impact area first.',
    ],
  },
  location: {
    title: 'Put your project on the map',
    body: [
      'Select the region where impact is delivered.',
      'Use Worldwide if your audience is global.',
      'Add location context in your description when helpful.',
    ],
  },
  image: {
    title: 'Add a banner image',
    body: [
      'Recommended size: 1200×675px.',
      'Use a crisp, on-brand visual with minimal text.',
      'Avoid blurry or heavily compressed images.',
    ],
  },
  addresses: {
    title: 'Receiving funding',
    body: [
      'Double-check the recipient wallet before publishing.',
      'Use the connected wallet if possible to avoid typos.',
      'Update the address any time your team rotates wallets.',
    ],
  },
  publish: {
    title: 'Before you publish',
    body: [
      'Confirm every section is complete and accurate.',
      'Preview to see how supporters will view your page.',
      'You can edit later, but a strong first impression matters.',
    ],
  },
}

export function CreateProjectProGuide({
  activeSection,
}: {
  activeSection: CreateFormSection
}) {
  const content = TIP_CONTENT[activeSection] ?? TIP_CONTENT.default

  return (
    <aside className="sticky top-24">
      <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5326ec]/10 text-[#5326ec]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12" y2="16" />
            </svg>
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-[#7f7f92]">
              Pro tips
            </p>
            <p className="text-base font-semibold text-[#1d1e1f]">
              {content.title}
            </p>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5 text-sm text-gray-700">
          {content.body.map(line => (
            <div key={line} className="flex gap-3">
              <span className="mt-[6px] h-2 w-2 rounded-full bg-[#5326ec]" />
              <p className="leading-relaxed text-gray-700">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default CreateProjectProGuide
