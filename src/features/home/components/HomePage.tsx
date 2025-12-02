import { ArrowRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";

import heroBanner from "@/../public/images/banners/intro-banner.svg";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
    blogPosts,
    featuredCampaigns,
    heroStats,
    introCards,
    latestUpdates,
    newCampaigns,
    partners,
} from "@/features/home/data/content";
import { cn } from "@/lib/utils/cn";

const sectionPadding =
    "w-full px-4 py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto text-[var(--color-text)]";

export function HomePage() {
    return (
        <div className="bg-[var(--color-surface)] text-[var(--color-text)]">
            <HeroSection />
            <section className={sectionPadding}>
                <div className="grid gap-6 md:grid-cols-3">
                    {heroStats.map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                    ))}
                </div>
            </section>
            <section className={cn(sectionPadding, "pt-0")}>
                <IntroCards />
            </section>
            <section className={sectionPadding}>
                {featuredCampaigns.map((campaign) => (
                    <CampaignHighlight key={campaign.id} campaign={campaign} />
                ))}
            </section>
            <section className={sectionPadding}>
                <SectionHeading
                    eyebrow="New campaigns"
                    title="Fresh causes curated for this season"
                />
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {newCampaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            </section>
            <section className={sectionPadding}>
                <WhyGivethSection />
            </section>
            <section className={sectionPadding}>
                <VideoSection />
            </section>
            <section className={sectionPadding}>
                <PartnersMarquee />
            </section>
            <section className={sectionPadding}>
                <BlogSection />
            </section>
            <section className={sectionPadding}>
                <GetUpdatesSection />
            </section>
            <section className={sectionPadding}>
                <LatestUpdatesSection />
            </section>
        </div>
    );
}

function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-[var(--color-surface)] pb-20 pt-24">
            <div className="absolute inset-0 bg-[url('/images/backgrounds/giv-background-homepage.svg')] opacity-40" />
            <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:px-8">
                <div className="max-w-2xl text-center lg:text-left">
                    <p className="inline-flex items-center gap-2 rounded-full bg-[var(--giv-primary-050)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--giv-primary-600)]">
                        Quadratic Funding
                    </p>
                    <h1 className="mt-6 text-4xl font-semibold leading-tight text-[var(--giv-primary-900)] sm:text-5xl">
                        Giveth empowers changemakers around the globe.
                    </h1>
                    <p className="mt-4 text-lg text-[var(--color-text-muted)]">
                        Join our community-driven movement to amplify impact through
                        donations, matching pools, and on-chain transparency.
                    </p>
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <Button size="lg" asChild>
                            <Link href="/projects">
                                Explore projects
                                <ArrowRightIcon className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="lg" asChild>
                            <Link href="/about#mission">
                                Our mission
                                <ArrowRightIcon className="h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="relative w-full max-w-md">
                    <div className="absolute -right-10 -top-8 h-24 w-24 rounded-full bg-[var(--giv-pinky-200)] blur-3xl" />
                    <div className="absolute -left-6 bottom-10 h-20 w-20 rounded-full bg-[var(--giv-cyan-200)] blur-3xl" />
                    <div className="relative rounded-[32px] border border-white/60 bg-white/80 p-4 shadow-card backdrop-blur">
                        <Image
                            src={heroBanner}
                            alt="Giveth hero banner"
                            className="w-full"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function IntroCards() {
    return (
        <div className="grid gap-5 lg:grid-cols-3">
            {introCards.map((card) => (
                <div
                    key={card.title}
                    className="rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-soft"
                >
                    <CardIcon type={card.icon} />
                    <h3 className="mt-4 text-2xl font-semibold text-[var(--giv-primary-900)]">
                        {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                        {card.description}
                    </p>
                    <Button
                        asChild
                        variant="ghost"
                        className="mt-4 justify-start px-0 text-[var(--giv-primary-600)]"
                    >
                        <Link href={card.cta.href}>
                            {card.cta.label}
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            ))}
        </div>
    );
}

function CardIcon({ type }: { type: "verified" | "donation" | "spark" }) {
    const base = "h-12 w-12 rounded-2xl bg-[var(--giv-gray-200)] p-3";
    if (type === "donation") {
        return (
            <div className={base} aria-hidden>
                <span className="block h-full w-full rounded-xl bg-[var(--giv-pinky-500)] opacity-70" />
            </div>
        );
    }
    if (type === "spark") {
        return (
            <div className={base} aria-hidden>
                <span className="block h-full w-full rounded-full bg-[var(--giv-cyan-500)] opacity-60" />
            </div>
        );
    }
    return (
        <div className={base} aria-hidden>
            <span className="block h-full w-full rounded-lg border border-dashed border-[var(--giv-gray-700)]" />
        </div>
    );
}

function CampaignHighlight({ campaign }: { campaign: (typeof featuredCampaigns)[0] }) {
    return (
        <div className="grid gap-8 rounded-[40px] border border-[var(--color-border)] bg-white p-8 shadow-card lg:grid-cols-2">
            <div className="space-y-5">
                {campaign.badge && (
                    <span className="inline-flex items-center rounded-full bg-[var(--giv-pinky-200)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--giv-pinky-700)]">
                        {campaign.badge}
                    </span>
                )}
                <h2 className="text-3xl font-semibold text-[var(--giv-deep-700)]">
                    {campaign.title}
                </h2>
                <p className="text-base text-[var(--color-text-muted)]">
                    {campaign.description}
                </p>
                <div className="flex flex-wrap gap-6 text-sm">
                    {campaign.stats.map((stat) => (
                        <div key={stat.label}>
                            <p className="font-semibold text-[var(--color-text)]">
                                {stat.value}
                            </p>
                            <p className="uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
                <Button size="lg" asChild>
                    <Link href={campaign.ctaHref}>
                        {campaign.ctaLabel}
                        <ArrowRightIcon className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--giv-gray-200)]/60 p-4">
                <Image
                    src={campaign.image}
                    alt={campaign.title}
                    width={640}
                    height={400}
                    className="h-auto w-full"
                />
            </div>
        </div>
    );
}

function CampaignCard({ campaign }: { campaign: (typeof newCampaigns)[0] }) {
    return (
        <div className="flex flex-col rounded-3xl border border-[var(--color-border)] bg-white p-6 shadow-soft">
            <Image
                src={campaign.image}
                alt={campaign.title}
                width={540}
                height={320}
                className="h-auto w-full rounded-2xl border border-[var(--color-border)] object-cover"
            />
            <div className="mt-6 space-y-3">
                <h3 className="text-2xl font-semibold text-[var(--giv-deep-700)]">
                    {campaign.title}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                    {campaign.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)]">
                    {campaign.stats.map((stat) => (
                        <span key={stat.label} className="rounded-full bg-[var(--giv-gray-200)] px-3 py-1">
                            {stat.label}: {stat.value}
                        </span>
                    ))}
                </div>
                <Button variant="secondary" asChild className="mt-4">
                    <Link href={campaign.ctaHref}>
                        {campaign.ctaLabel}
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function WhyGivethSection() {
    const items = [
        {
            title: "Transparent impact",
            body: "Every donation is traceable on-chain with verifiable reports and milestones.",
        },
        {
            title: "Community governance",
            body: "Quadratic Funding, GIVpower, and Passport keep incentives aligned with donors.",
        },
        {
            title: "Global support",
            body: "Hundreds of local communities rely on Giveth matching rounds to keep thriving.",
        },
    ];
    return (
        <div className="rounded-[32px] border border-[var(--color-border)] bg-white p-10 shadow-soft">
            <SectionHeading eyebrow="Why Giveth" title="Designed for public goods" />
            <div className="mt-10 grid gap-6 md:grid-cols-3">
                {items.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-[var(--color-border)] p-6">
                        <h3 className="text-xl font-semibold text-[var(--giv-primary-900)]">
                            {item.title}
                        </h3>
                        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                            {item.body}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function VideoSection() {
    return (
        <div className="grid gap-8 rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-soft lg:grid-cols-2">
            <div>
                <SectionHeading
                    eyebrow="Watch"
                    title="What is Giveth?"
                    align="left"
                />
                <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                    Learn how Giveth combines transparent donations, matching, and
                    programmable incentives to empower regenerative projects around the
                    world.
                </p>
                <Button variant="ghost" className="mt-6" asChild>
                    <Link href="https://youtu.be/Z3JUTl6baAQ" target="_blank">
                        Watch on YouTube
                        <ExternalLinkIcon className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="aspect-video rounded-2xl border border-[var(--color-border)] bg-black/90">
                <iframe
                    title="Giveth intro"
                    className="h-full w-full rounded-2xl"
                    src="https://www.youtube.com/embed/Z3JUTl6baAQ"
                    allowFullScreen
                />
            </div>
        </div>
    );
}

function PartnersMarquee() {
    return (
        <div className="rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-soft">
            <SectionHeading
                eyebrow="Partners"
                title="Backed by leading ecosystems"
            />
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 md:gap-12">
                {partners.map((partner) => (
                    <div
                        key={partner.name}
                        className="flex h-16 w-40 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--giv-gray-200)]"
                    >
                        <span className="text-sm font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                            {partner.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BlogSection() {
    return (
        <div>
            <SectionHeading eyebrow="From the blog" title="Stories from the commons" />
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {blogPosts.map((post) => (
                    <article
                        key={post.id}
                        className="flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-soft"
                    >
                        <Image
                            src={post.image}
                            alt={post.title}
                            width={480}
                            height={280}
                            className="h-48 w-full object-cover"
                        />
                        <div className="flex flex-1 flex-col gap-4 p-6">
                            <h3 className="text-xl font-semibold text-[var(--giv-primary-900)]">
                                {post.title}
                            </h3>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {post.excerpt}
                            </p>
                            <Button
                                variant="ghost"
                                className="mt-auto justify-start px-0 text-[var(--giv-primary-600)]"
                                asChild
                            >
                                <Link href={post.href} target="_blank">
                                    Read article
                                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

function GetUpdatesSection() {
    return (
        <div className="rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-soft">
            <SectionHeading
                eyebrow="Stay in the loop"
                title="Get impact updates and QF announcements"
            />
            <form className="mt-6 flex flex-col gap-4 md:flex-row">
                <input
                    type="email"
                    placeholder="Email address"
                    className="h-12 flex-1 rounded-full border border-[var(--color-border)] bg-[var(--giv-gray-200)]/70 px-5 text-sm outline-none focus:ring-2 focus:ring-[var(--giv-primary-400)]"
                />
                <Button type="submit" size="lg">
                    Subscribe
                </Button>
            </form>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                By subscribing you agree to receive updates from Giveth. No spam, ever.
            </p>
        </div>
    );
}

function LatestUpdatesSection() {
    return (
        <div className="rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-soft">
            <SectionHeading
                eyebrow="Latest updates"
                title="Project stories fresh from the field"
            />
            <div className="mt-6 divide-y divide-[var(--color-border)]">
                {latestUpdates.map((update) => (
                    <Link
                        key={update.id}
                        href={update.href}
                        className="flex flex-col gap-3 py-4 text-[var(--color-text)] transition hover:text-[var(--giv-primary-600)] md:flex-row md:items-center md:justify-between"
                    >
                        <div>
                            <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
                                {update.project}
                            </p>
                            <p className="text-base">{update.excerpt}</p>
                        </div>
                        <span className="text-sm text-[var(--color-text-muted)]">
                            {update.date}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function SectionHeading({
    eyebrow,
    title,
    align = "center",
}: {
    eyebrow: string;
    title: string;
    align?: "left" | "center";
}) {
    return (
        <div
            className={cn(
                "space-y-4",
                align === "center" ? "text-center" : "text-left",
            )}
        >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-text-muted)]">
                {eyebrow}
            </p>
            <h2 className="text-3xl font-semibold text-[var(--giv-deep-700)]">
                {title}
            </h2>
        </div>
    );
}

