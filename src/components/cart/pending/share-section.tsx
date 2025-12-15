import { Facebook, Linkedin, Share2, Twitter } from 'lucide-react'

export function ShareSection() {
  return (
    <div className="bg-white rounded-2xl border border-[#ebecf2] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-[#1f2333]" />
        <h2 className="text-lg font-bold text-[#1f2333]">Spread the Impact!</h2>
      </div>

      {/* Share Message Box */}
      <div className="border-2 border-dashed border-[#ebecf2] rounded-xl p-6 mb-4">
        <p className="text-center text-[#4f576a]">
          I just supported [Project Name/s] on Giveth! Join me in funding public
          goods. <span className="text-[#e1458d]">💜</span> #GIVbacks
        </p>
      </div>

      {/* Social Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button className="w-12 h-12 rounded-full border border-[#ebecf2] flex items-center justify-center hover:bg-[#f7f7f9] transition-colors">
          <Twitter className="w-5 h-5 text-[#1f2333]" />
        </button>
        <button className="w-12 h-12 rounded-full border border-[#ebecf2] flex items-center justify-center hover:bg-[#f7f7f9] transition-colors">
          <Linkedin className="w-5 h-5 text-[#1f2333]" />
        </button>
        <button className="w-12 h-12 rounded-full border border-[#ebecf2] flex items-center justify-center hover:bg-[#f7f7f9] transition-colors">
          <Facebook className="w-5 h-5 text-[#1f2333]" />
        </button>
      </div>
    </div>
  )
}
