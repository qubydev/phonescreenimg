'use client'

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Plus, Minus } from "lucide-react"

export default function AngleSlider({
  label,
  axis,
  value,
  min,
  max,
  onAngleChange,
  onStepAngle
}) {
  return (
    <div className="space-y-1.5 p-2.5 rounded-xl bg-secondary/20 border border-border/30">
      <div className="flex justify-between text-[11px] font-medium px-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground font-semibold">{value}°</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md shrink-0 hover:bg-background/80"
          onClick={() => onStepAngle(axis, -1, min, max)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={1}
          className="flex-1 cursor-grab active:cursor-grabbing"
          onValueChange={(val) => onAngleChange(axis, val[0])}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md shrink-0 hover:bg-background/80"
          onClick={() => onStepAngle(axis, 1, min, max)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
