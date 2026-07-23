import { useEffect, useRef } from "react"
import { useRenderer } from "@opentui/react"

type KeyEvent = { name: string; ctrl: boolean }

export function useKeyboardEffect(handler: (key: KeyEvent) => void) {
  const renderer = useRenderer()
  const ref = useRef(handler)
  ref.current = handler

  useEffect(() => {
    const h = (key: KeyEvent) => { ref.current(key) }
    renderer.keyInput.on("keypress", h)
    return () => { renderer.keyInput.off("keypress", h) }
  }, [renderer])
}
