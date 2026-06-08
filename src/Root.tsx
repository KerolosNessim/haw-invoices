import { useEffect } from "react"
import { DirectionProvider } from "@/components/ui/direction"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useTranslation } from "react-i18next"
import App from "./App"
import { QueryProvider } from "./providers/query-provider"

export default function Root() {
  const { i18n } = useTranslation()
  const dir = i18n.dir()

  useEffect(() => {
    const lang = i18n.language.startsWith("ar") ? "ar" : "en"
    document.documentElement.dir = dir
    document.documentElement.lang = lang
    document.body.dir = dir
  }, [dir, i18n.language])

  return (
    <QueryProvider>
      <DirectionProvider dir={dir as "ltr" | "rtl"} direction={dir as "ltr" | "rtl"}>
        <TooltipProvider>
          <App />
          <Toaster position="top-center" />
        </TooltipProvider>
      </DirectionProvider>
    </QueryProvider>
  )
}
