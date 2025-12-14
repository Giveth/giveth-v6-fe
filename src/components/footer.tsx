import {
  Github,
  Globe,
  Instagram,
  MessageCircle,
  Twitter,
  Youtube,
} from 'lucide-react'

const footerLinks = {
  left: [
    { label: 'Home', href: '#' },
    { label: 'Projects', href: '#' },
    { label: 'About Us', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Support', href: '#' },
  ],
  center: [
    { label: 'Join Our Community', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'Terms of Use', href: '#' },
    { label: 'Onboarding Guide', href: '#' },
  ],
  right: [
    { label: 'Partnerships', href: '#' },
    { label: "We're Hiring!", href: '#' },
  ],
}

const socialLinks = [
  { icon: Instagram, href: '#' },
  { icon: Twitter, href: '#' },
  { icon: Github, href: '#' },
  { icon: Youtube, href: '#' },
  { icon: MessageCircle, href: '#' },
  { icon: Globe, href: '#' },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#ebecf2] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Left Column */}
          <div className="space-y-3">
            {footerLinks.left.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-[#82899a] hover:text-[#5326ec] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Center Column */}
          <div className="space-y-3">
            {footerLinks.center.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-[#82899a] hover:text-[#5326ec] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {footerLinks.right.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-[#82899a] hover:text-[#5326ec] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Social Links and Support */}
        <div className="flex items-center justify-between pt-8 border-t border-[#ebecf2]">
          <div className="flex items-center gap-4">
            {socialLinks.map((social, idx) => {
              const Icon = social.icon
              return (
                <a
                  key={idx}
                  href={social.href}
                  className="w-8 h-8 rounded-full bg-[#f7f7f9] flex items-center justify-center text-[#82899a] hover:bg-[#5326ec] hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#82899a]">Support us</span>
            <span className="text-sm font-medium bg-gradient-to-r from-[#5326ec] to-[#8668fc] bg-clip-text text-transparent">
              with your donation
            </span>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mt-8 flex justify-end">
          <button className="flex items-center gap-2 text-sm text-[#82899a] hover:text-[#5326ec]">
            <Globe className="w-4 h-4" />
            Choose Language
          </button>
        </div>
      </div>
    </footer>
  )
}
