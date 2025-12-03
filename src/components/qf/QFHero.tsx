export function QFHero() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-[#624AF2] to-[#533BE5] p-8 text-white shadow-lg sm:p-12">
      {/* Decorative background curves - simplified for now */}
      <div className="absolute top-0 right-0 h-full w-1/2 opacity-20">
        <div className="h-full w-full rounded-l-full bg-white blur-3xl transform translate-x-1/3" />
      </div>

      <div className="relative z-10 flex flex-col items-start gap-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Green horizon round
        </h1>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-2 backdrop-blur-sm">
          <span className="font-medium">Round Ends In 4d 13h 48min</span>
        </div>
      </div>
    </div>
  )
}
