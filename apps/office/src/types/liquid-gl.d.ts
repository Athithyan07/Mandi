declare module "liquid-gl" {
  export interface LiquidGLOptions {
    target: string | HTMLElement
    snapshot?: string
    engine?: "auto" | "webgpu" | "webgl2" | "webgl"
    resolution?: number
    zIndex?: number
    content?: string
    refraction?: number
    aberration?: number
    bevelDepth?: number
    bevelWidth?: number
    frost?: number
    shadow?: boolean
    specular?: boolean
    tint?: string
    interaction?: "fluid" | "none"
    interactionStrength?: number
    interactionRadius?: number
    interactionViscosity?: number
    reveal?: "fade" | "none"
    tilt?: boolean
    tiltFactor?: number
    tiltEase?: number
    draggable?: boolean
  }

  export interface LiquidGLInstance {
    destroy: () => void
    setTint?: (tint: string) => void
    setDraggable?: (draggable: boolean) => void
    render?: () => void
  }

  export default function liquidGL(options: LiquidGLOptions): LiquidGLInstance
}
