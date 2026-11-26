"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/** Pop-up messages ("Saved", "Your message wasn't sent"…) in the site's colours: cream card, green ticks, soft red for problems. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      // The site has no dark mode, so the messages always use the light, cream look.
      theme="light"
      className="toaster group"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:bg-white group-[.toaster]:text-stone-800 group-[.toaster]:border-stone-200 group-[.toaster]:shadow-lg group-[.toaster]:font-sans",
          title: "group-[.toast]:font-medium",
          description: "group-[.toast]:text-stone-600",
          success: "group-[.toaster]:border-sage-200 [&_[data-icon]]:text-sage-700",
          error: "group-[.toaster]:border-red-200 [&_[data-icon]]:text-red-600",
          closeButton: "group-[.toast]:bg-white group-[.toast]:text-stone-500 group-[.toast]:border-stone-200 hover:group-[.toast]:text-stone-800",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
