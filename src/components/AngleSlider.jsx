'use client'

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Plus, Minus } from "lucide-react"

export default function AngleSlider({
  label,
  value,
  displayValue,
  min,
  max,
  step = 1,
  onChange,
  onStep
}) {
  const display = displayValue ?? `${value}°`

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground font-semibold tracking-tight">{display}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-lg shrink-0 transition-all duration-150"
          onClick={() => onStep(-1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          className="flex-1 cursor-grab active:cursor-grabbing"
          onValueChange={(val) => onChange(val[0])}
        />
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 rounded-lg shrink-0 transition-all duration-150"
          onClick={() => onStep(1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
