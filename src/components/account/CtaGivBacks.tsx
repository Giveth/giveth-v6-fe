import { type UrlObject } from 'url'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { givBacksLink } from '@/lib/constants/menu-links'

export function CtaSection() {
  return (
    <section className="py-20 relative overflow-hidden ">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="bg-give-get-giv py-16">
          <h2 className="text-5xl font-bold text-giv-primary-500 mb-4 text-balance">
            Give and get GIV
          </h2>
          <p className="text-2xl text-giv-primary-500 mb-8">
            Are you new to the GIVeconomy?
          </p>
          <Link
            href={givBacksLink?.href as unknown as UrlObject}
            className="inline-flex items-center gap-2 px-8 py-4 bg-giv-primary-500 text-white! text-sm font-bold rounded-xl hover:bg-giv-primary-700 transition-colors"
          >
            Learn More Here
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
