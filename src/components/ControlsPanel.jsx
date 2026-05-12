'use client'

import { Button } from "@/components/ui/button"
import { Upload, Download, RotateCcw, Sparkles, Layers, Sliders } from "lucide-react"
import AngleSlider from "@/components/AngleSlider"

export default function ControlsPanel({
  uploaded,
  fileName,
  loading,
  currentPoseName,
  rotX,
  rotY,
  rotZ,
  onImageUpload,
  onDownload,
  onResetPose,
  onRandomPose,
  onAngleChange,
  onStepAngle
}) {
  return (
    <div className="w-full md:w-[420px] h-[45%] md:h-full bg-card/30 backdrop-blur-2xl p-6 overflow-y-auto flex flex-col justify-between gap-6 z-20 border-l border-border/40 shadow-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/80 pb-4">
          <div>
            <h1 className="text-sm font-bold tracking-tight">Studio Setup</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Customize display target & device pose</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
            onClick={onResetPose}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Layers className="w-3.5 h-3.5 text-primary/80" />
            <span>Screen Artwork</span>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-all group relative overflow-hidden">
            <div className="flex flex-col items-center justify-center text-center px-4 relative z-10">
              <Upload className="w-4 h-4 mb-1.5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
              <p className="text-xs font-medium text-foreground truncate max-w-[260px]">
                {uploaded ? fileName : "Click to embed media"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Optimal size: 1290 x 2796 px</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary/80" />
            <span>Quick Framing</span>
          </div>
          <div className="p-1.5 rounded-xl bg-secondary/20 border border-border/30">
            <Button
              variant="ghost"
              className="w-full justify-center h-10 text-xs font-medium bg-background/50 hover:bg-background text-foreground tracking-wide rounded-lg shadow-sm transition-all"
              onClick={onRandomPose}
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" />
              Randomize Perspective
            </Button>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sliders className="w-3.5 h-3.5 text-primary/80" />
            <span>Precise Orientation</span>
          </div>

          <AngleSlider
            label="Pan (Y Axis)"
            axis="y"
            value={rotY}
            min={-180}
            max={180}
            onAngleChange={onAngleChange}
            onStepAngle={onStepAngle}
          />

          <AngleSlider
            label="Tilt (X Axis)"
            axis="x"
            value={rotX}
            min={-90}
            max={90}
            onAngleChange={onAngleChange}
            onStepAngle={onStepAngle}
          />

          <AngleSlider
            label="Roll (Z Axis)"
            axis="z"
            value={rotZ}
            min={-180}
            max={180}
            onAngleChange={onAngleChange}
            onStepAngle={onStepAngle}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border/60 mt-auto">
        <Button
          className="w-full h-11 rounded-xl shadow-lg font-semibold text-xs tracking-wide transition-all duration-200 active:scale-[0.98]"
          disabled={loading}
          onClick={onDownload}
        >
          <Download className="w-4 h-4 mr-2 stroke-[2.5]" />
          Export High-Res PNG
        </Button>
      </div>
    </div>
  )
}
