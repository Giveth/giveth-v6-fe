export type HomeStatistic = {
    label: string;
    value: string;
    helper?: string;
};

export type HomeIntroCard = {
    title: string;
    description: string;
    cta: {
        label: string;
        href: string;
    };
    icon: "verified" | "donation" | "spark";
};

export type Campaign = {
    id: string;
    title: string;
    description: string;
    badge?: string;
    image: string;
    ctaLabel: string;
    ctaHref: string;
    stats: Array<{ label: string; value: string }>;
};

export type BlogPost = {
    id: string;
    title: string;
    excerpt: string;
    href: string;
    image: string;
};

export type Partner = {
    name: string;
    logo: string;
};

export type UpdateItem = {
    id: string;
    project: string;
    excerpt: string;
    date: string;
    href: string;
};

export const heroStats: HomeStatistic[] = [
    {
        label: "Public goods funded",
        value: "$4.2M+",
        helper: "Raised across Quadratic Funding rounds.",
    },
    {
        label: "Verified projects",
        value: "2,100+",
        helper: "Impact creators vetted by the community.",
    },
    {
        label: "Unique donors",
        value: "37k+",
        helper: "Passport-verified contributors worldwide.",
    },
];

export const introCards: HomeIntroCard[] = [
    {
        title: "Verified projects",
        description:
            "Trust that your donations will make an impact with fully verified teams.",
        cta: {
            label: "How it works",
            href: "https://docs.giveth.io/verification/",
        },
        icon: "verified",
    },
    {
        title: "Donor rewards",
        description: "Earn GIVbacks and perks every time you donate on Giveth.",
        cta: {
            label: "Learn more",
            href: "https://docs.giveth.io/donate/givbacks/",
        },
        icon: "donation",
    },
    {
        title: "Easy onboarding",
        description: "New to crypto? Onboard in minutes with guided flows.",
        cta: {
            label: "Get started",
            href: "/onboarding",
        },
        icon: "spark",
    },
];

export const featuredCampaigns: Campaign[] = [
    {
        id: "giveth-qf",
        title: "Giveth QF Season 6",
        description:
            "Amplify matching for climate-positive, regenerative, and web3 public goods projects.",
        badge: "Featured",
        image: "/images/banners/intro-banner.svg",
        ctaLabel: "Explore round",
        ctaHref: "/qf",
        stats: [
            { label: "Matching pool", value: "$650k" },
            { label: "Projects", value: "136" },
            { label: "Ends", value: "Jan 20" },
        ],
    },
];

export const newCampaigns: Campaign[] = [
    {
        id: "climate-guild",
        title: "Climate Guild",
        description:
            "A curated collection of projects regenerating ecosystems and stewarding commons.",
        image: "/images/banners/intro-banner.svg",
        ctaLabel: "View cause",
        ctaHref: "/causes/climate",
        stats: [
            { label: "Projects", value: "42" },
            { label: "Raised", value: "$1.3M" },
        ],
    },
    {
        id: "impact-dao",
        title: "Impact DAOs",
        description:
            "Supporting decentralized collectives powering public infrastructure.",
        image: "/images/banners/intro-banner.svg",
        ctaLabel: "View cause",
        ctaHref: "/causes/impact-daos",
        stats: [
            { label: "Projects", value: "27" },
            { label: "Raised", value: "$780k" },
        ],
    },
];

export const blogPosts: BlogPost[] = [
    {
        id: "passport",
        title: "Why Passport verification matters for QF fairness",
        excerpt:
            "Human verification keeps quadratic funding outcomes sybil resistant while empowering real donors.",
        href: "https://giveth.io/blog/passport",
        image: "/images/banners/intro-banner.svg",
    },
    {
        id: "givbacks",
        title: "How to maximize your GIVbacks rewards",
        excerpt:
            "Stack incentives with every donation using the GIVpower and referral programs.",
        href: "https://giveth.io/blog/givbacks-guide",
        image: "/images/banners/intro-banner.svg",
    },
    {
        id: "impact",
        title: "Season recap: the projects moving the needle",
        excerpt:
            "Highlights from regenerative finance, education, and humanitarian projects funded this season.",
        href: "https://giveth.io/blog/season-recap",
        image: "/images/banners/intro-banner.svg",
    },
];

export const partners: Partner[] = [
    { name: "Optimism", logo: "/images/logos/optimism.svg" },
    { name: "Gnosis", logo: "/images/logos/gnosis.svg" },
    { name: "Bankless", logo: "/images/logos/bankless.svg" },
    { name: "Metagov", logo: "/images/logos/metagov.svg" },
];

export const latestUpdates: UpdateItem[] = [
    {
        id: "1",
        project: "Commons Stack",
        excerpt: "Launched a new bonding curve for community-governed treasuries.",
        date: "Nov 18",
        href: "/project/commons-stack",
    },
    {
        id: "2",
        project: "ReFi Medellín",
        excerpt: "Planted 2,300 mangroves thanks to QF matching.",
        date: "Nov 12",
        href: "/project/refi-medellin",
    },
    {
        id: "3",
        project: "Masaai Regeneration",
        excerpt: "Installed solar-powered water pumps across three villages.",
        date: "Nov 05",
        href: "/project/masaai-regeneration",
    },
];

