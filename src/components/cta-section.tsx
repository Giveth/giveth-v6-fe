import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#f6f3ff] to-[#e7e1ff] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-20 w-64 h-64 bg-[#8668fc]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-20 w-64 h-64 bg-[#5326ec]/10 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-5xl font-bold text-[#5326ec] mb-4 text-balance">
          Give and get GIV
        </h2>
        <p className="text-xl text-[#4f576a] mb-8">
          Are you new to the GIVeconomy?
        </p>
        <Button
          size="lg"
          className="bg-[#5326ec] hover:bg-[#6c00f6] text-white gap-2 text-base px-8"
        >
          Learn More Here
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  )
}
