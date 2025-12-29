import * as Switch from '@radix-ui/react-switch'
import { HelpTooltip } from '../HelpTooltip'

export function AnonymousOption() {
  return (
    <div className="bg-white rounded-xl border border-[#ebecf2] p-5 mt-5">
      <div className="flex items-center gap-3">
        <Switch.Root
          className="
            relative h-5 w-8 shrink-0 cursor-pointer rounded-full
            bg-[#e6e8f0] transition-colors
            data-[state=checked]:bg-[#5326ec]
          "
        >
          <Switch.Thumb
            className="
              block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow
              transition-transform
              data-[state=checked]:translate-x-[13px]
            "
          />
        </Switch.Root>

        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-giv-gray-900">
            Make my donation anonymous
          </span>
          <HelpTooltip text="By checking this, we won't consider your profile information as a donor for this donation and won't show it on public pages." />
        </div>
      </div>
    </div>
  )
}
