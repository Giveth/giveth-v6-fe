'use client'

import type { JSX } from 'react'
import Link from 'next/link'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'
import type { Route } from 'next'

type FeatureCard = {
  title: string
  description: string
  cta: string
  href: string
  tone: 'pink' | 'teal' | 'purple'
  Icon: () => JSX.Element
}

type ProgramCard = {
  title: string
  description: string
  href: string
  label?: string
}

const featureCards: FeatureCard[] = [
  {
    title: 'Verified projects',
    description:
      'Trust that your donations will make an impact with community-vetted, GIVbacks-eligible projects.',
    cta: 'How it works',
    href: 'https://docs.giveth.io/projectverification',
    tone: 'pink',
    Icon: ShieldIcon,
  },
  {
    title: 'Donor rewards',
    description:
      'Get rewarded for giving to GIVbacks eligible projects with crypto donations.',
    cta: 'Earn GIVbacks',
    href: 'https://docs.giveth.io/givbacks',
    tone: 'teal',
    Icon: GiftIcon,
  },
  {
    title: 'Easy onboarding',
    description:
      'New to crypto? Follow our guided flows to start donating in minutes.',
    cta: 'Get started',
    href: '/create/project',
    tone: 'purple',
    Icon: SparkIcon,
  },
]

const programCards: ProgramCard[] = [
  {
    title: 'Quadratic Funding',
    description:
      'Pool community donations and matching funds to maximize impact for public goods.',
    href: '/qf',
    label: 'Featured',
  },
  {
    title: 'Zero-fee donations',
    description:
      '100% of what you give goes to the projects you care about. No platform fees, ever.',
    href: 'https://docs.giveth.io/zero-fees',
  },
  {
    title: 'GIVeconomy rewards',
    description:
      'Boost projects with GIVpower, earn GIV through GIVbacks, and join our donor-owned economy.',
    href: 'https://docs.giveth.io/giveconomy',
  },
]

const partnerNames = [
  'Gitcoin',
  'Commons Stack',
  'Supermodular',
  'Gnosis',
  'Octant',
  'Regen RFP',
]

const blogCards = [
  {
    title: 'Latest from the Giveth Blog',
    description: 'Stories, product updates, and deep dives from the team.',
    href: 'https://blog.giveth.io/',
  },
  {
    title: 'News & announcements',
    description: 'Catch the newest campaigns, partners, and QF rounds.',
    href: 'https://news.giveth.io/',
  },
]

export default function Home() {
  const { data, isLoading, error } = useActiveQfRounds()
  const activeSlug = data?.activeQfRounds?.[0]?.slug
  const activeRoundHref = activeSlug ? (`/qf/${activeSlug}` as Route) : null
  const qfLandingHref = (activeRoundHref ?? '/donation') as Route

  const qfCtaLabel = (() => {
    if (activeSlug) return 'View active QF round'
    if (isLoading) return 'Checking for active rounds...'
    if (error) return 'Unable to load active round'
    return 'Quadratic Funding'
  })()

  const statCards = [
    { label: 'Projects on Giveth', value: '2,700+' },
    { label: 'Donated to projects', value: '~$50M' },
    { label: 'Number of givers', value: '90k+' },
  ]

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-gray-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ffe4f3] via-[#fdf4ff] to-[#e6f7f5]">
        <div className="absolute left-10 top-16 h-32 w-32 rounded-full bg-[#fdc1e1] opacity-40 blur-3xl" />
        <div className="absolute right-6 bottom-10 h-24 w-24 rounded-full bg-[#9de6dd] opacity-40 blur-3xl" />
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:py-20 md:flex-row md:items-center md:py-24">
          <div className="relative z-10 flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#d81a72] shadow-sm ring-1 ring-[#ffd0e7]">
              Giveth empowers changemakers
            </span>
            <h1 className="text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
              Giveth empowers changemakers to accept crypto donations.
            </h1>
            <p className="text-base text-gray-600 sm:text-lg">
              Join our community-driven movement to transform how we fund public
              goods, nonprofits, and social causes using innovative crypto
              fundraising strategies.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#explore"
                className="rounded-full bg-[#d81a72] px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#b0155c]"
              >
                Explore projects
              </a>
              <a
                href="https://docs.giveth.io/what-is-giveth/about-giveth#mission"
                className="inline-flex items-center gap-2 rounded-full border border-[#d81a72] px-5 py-3 text-sm font-bold text-[#d81a72] transition-colors hover:bg-pink-50"
              >
                Our mission
                <ArrowIcon />
              </a>
              {activeRoundHref ? (
                <Link
                  href={activeRoundHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold text-[#d81a72] shadow-sm ring-1 ring-[#ffd0e7] transition-colors hover:bg-pink-50"
                >
                  {qfCtaLabel}
                  <ArrowIcon />
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200">
                <SparkIcon />
                Zero fees
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200">
                <GiftIcon />
                Rewards for donors
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 ring-1 ring-gray-200">
                <ShieldIcon />
                Verified projects
              </span>
            </div>
          </div>
          <div className="relative z-10 flex-1">
            <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#d81a72]">
                    Donation flow
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">
                    Build a cart, donate together
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Curate projects, enter amounts, and check out with a single
                    transaction.
                  </p>
                </div>
                <span className="rounded-full bg-[#fef2f7] px-3 py-1 text-xs font-bold text-[#d81a72]">
                  Zero fees
                </span>
              </div>
              <div className="mt-6 space-y-3 rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fef2f7] text-[#d81a72]">
                      <SparkIcon />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Super duper round
                      </p>
                      <p className="text-xs text-gray-500">Gnosis · QF</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#e0f8f6] px-3 py-1 text-xs font-bold text-[#37b4a9]">
                    {qfCtaLabel}
                  </span>
                </div>
                <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      Your cart
                    </p>
                    <Link
                      href="/donation"
                      className="text-xs font-semibold text-[#d81a72] hover:text-[#b0155c]"
                    >
                      Review
                    </Link>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <span>ReFi Commons</span>
                      <span className="font-semibold text-gray-900">$25</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <span>Community Gardens</span>
                      <span className="font-semibold text-gray-900">$15</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm font-bold text-gray-900">
                    <span>Total</span>
                    <span>$40</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="explore" className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map(card =>
            card.href.startsWith('http') ? (
              <a
                key={card.title}
                href={card.href}
                target="_blank"
                rel="noreferrer"
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
              >
                <FeatureCardContent card={card} />
              </a>
            ) : (
              <Link
                key={card.title}
                href={card.href as Route}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
              >
                <FeatureCardContent card={card} />
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="bg-[#0f172a]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-center sm:py-14">
          <div className="flex-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#fdc1e1]">
              Why Giveth
            </p>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Donate with zero fees, stay for the GIVbacks rewards.
            </h2>
            <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
              Your crypto donations, and participation in the GIVeconomy, help
              us build a new future where impact projects thrive through their
              own regenerative economies.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-white">
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                Zero platform fees
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                Donor rewards
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                Community-led governance
              </span>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid gap-4 sm:grid-cols-3">
              {statCards.map(stat => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/5 px-4 py-5 text-white ring-1 ring-white/10"
                >
                  <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-gray-300">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d81a72]">
              Programs & rewards
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Mirror the Giveth experience from dapps v2
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Quadratic funding, zero-fee donations, and the full GIVeconomy are
              here. Explore the same programs, copies, and calls-to-action the
              community already loves.
            </p>
          </div>
          <Link
            href={qfLandingHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#d81a72] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b0155c]"
          >
            {qfCtaLabel}
            <ArrowIcon />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {programCards.map(program =>
            program.href.startsWith('http') ? (
              <a
                key={program.title}
                href={program.href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
              >
                <ProgramCardContent program={program} />
              </a>
            ) : (
              <Link
                key={program.title}
                href={program.href as Route}
                className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
              >
                <ProgramCardContent program={program} />
              </Link>
            ),
          )}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d81a72]">
                Watch & learn
              </p>
              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                See how the GIVeconomy works
              </h2>
              <p className="text-sm text-gray-600">
                Dive into the same explainer used on dapps v2. Understand how
                donors, builders, and partners collaborate through GIVbacks,
                GIVpower, and quadratic funding.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.youtube.com/givethio"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#d81a72] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b0155c]"
                >
                  Watch video
                  <ArrowIcon />
                </a>
                <a
                  href="https://docs.giveth.io/giveconomy"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-gray-900 transition hover:bg-gray-50"
                >
                  Read docs
                </a>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ffe4f3] via-white to-[#e0f8f6] p-1 shadow-lg">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-black/5">
                  <iframe
                    title="Giveth intro video"
                    src="https://www.youtube.com/embed/NcfwqsGG0KM"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f9fafb]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-[#d81a72]">
            Trusted by partners
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {partnerNames.map(name => (
              <span
                key={name}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-100"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {blogCards.map(card => (
            <a
              key={card.title}
              href={card.href}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d81a72]">
                Blog & updates
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-900">
                {card.title}
              </h3>
              <p className="mt-3 text-sm text-gray-600">{card.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#d81a72] group-hover:text-[#b0155c]">
                Read more
                <ArrowIcon />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="bg-[#0f172a]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-[#1f2937] via-[#111827] to-[#0f172a] p-8 shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#fdc1e1]">
                Stay updated
              </p>
              <h3 className="text-2xl font-extrabold sm:text-3xl">
                Get the same updates you loved on dapps v2
              </h3>
              <p className="text-sm text-gray-300">
                Join our newsletter to receive campaign launches, QF round
                announcements, and builder stories.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:min-w-[320px]">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-full border border-gray-600 bg-transparent px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:border-[#d81a72] focus:outline-none"
              />
              <a
                href="https://news.giveth.io/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d81a72] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b0155c]"
              >
                Subscribe
                <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3L5 6V11C5 15.4183 8.13401 19.4183 12 21C15.866 19.4183 19 15.4183 19 11V6L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GiftIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="8"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 12H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 6C9 4.89543 9.89543 4 11 4C12.1046 4 13 4.89543 13 6C13 7.10457 12.1046 8 11 8H3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 6C15 4.89543 15.8954 4 17 4C18.1046 4 19 4.89543 19 6C19 7.10457 18.1046 8 17 8H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L13.76 8.24L20 10L13.76 11.76L12 18L10.24 11.76L4 10L10.24 8.24L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FeatureCardContent({ card }: { card: FeatureCard }) {
  return (
    <>
      <div
        className={`absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full opacity-10 ${
          card.tone === 'pink'
            ? 'bg-[#d81a72]'
            : card.tone === 'teal'
              ? 'bg-[#37b4a9]'
              : 'bg-[#7c3aed]'
        }`}
      />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-gray-900">
        <card.Icon />
      </div>
      <h3 className="relative mt-4 text-lg font-bold text-gray-900">
        {card.title}
      </h3>
      <p className="relative mt-2 text-sm text-gray-600">{card.description}</p>
      <span className="relative mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#d81a72] group-hover:text-[#b0155c]">
        {card.cta}
        <ArrowIcon />
      </span>
    </>
  )
}

function ProgramCardContent({ program }: { program: ProgramCard }) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-gray-900">{program.title}</h3>
        {program.label ? (
          <span className="rounded-full bg-[#fef2f7] px-3 py-1 text-xs font-bold text-[#d81a72]">
            {program.label}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-gray-600">{program.description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#d81a72] group-hover:text-[#b0155c]">
        Learn more
        <ArrowIcon />
      </span>
    </>
  )
}
