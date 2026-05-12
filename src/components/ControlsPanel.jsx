'use client'

import { Button } from "@/components/ui/button"
import { Upload, Download, RotateCcw, Sparkles, Layers, Sliders, ZoomIn } from "lucide-react"
import AngleSlider from "@/components/AngleSlider"

export default function ControlsPanel({
  uploaded,
  fileName,
  loading,
  rotX,
  rotY,
  rotZ,
  zoom,
  onImageUpload,
  onDownload,
  onResetPose,
  onRandomPose,
  onAngleChange,
  onStepAngle,
  onZoomChange,
  onZoomStep
}) {
  return (
    <div className="w-full md:w-[440px] h-[45%] md:h-full bg-card/30 backdrop-blur-2xl p-7 overflow-y-auto flex flex-col justify-between gap-6 z-20 border-l border-border/40 shadow-2xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Layers className="w-4 h-4 text-primary/80" />
            <span>Screen Artwork</span>
          </div>
          <label className="flex items-center w-full h-14 px-4 border border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-all group">
            <Upload className="w-4 h-4 shrink-0 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground truncate flex-1">
              {uploaded ? fileName : "Click to upload screenshot or artwork"}
            </span>
            {uploaded && (
              <span className="text-[10px] text-primary font-semibold shrink-0 ml-2">Uploaded</span>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={onImageUpload} />
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary/80" />
            <span>Device Pose</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="h-10 text-xs font-medium tracking-wide rounded-lg"
              onClick={onResetPose}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-10 text-xs font-medium tracking-wide rounded-lg"
              onClick={onRandomPose}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Randomize
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ZoomIn className="w-4 h-4 text-primary/80" />
            <span>Camera</span>
          </div>
          <AngleSlider
            label="Zoom"
            value={zoom}
            displayValue={`${zoom.toFixed(1)}x`}
            min={3.5}
            max={9}
            step={0.1}
            onChange={onZoomChange}
            onStep={onZoomStep}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sliders className="w-4 h-4 text-primary/80" />
            <span>Orientation</span>
          </div>

          <AngleSlider
            label="Pan (Y)"
            value={rotY}
            displayValue={`${rotY}°`}
            min={-180}
            max={180}
            onChange={(val) => onAngleChange('y', val)}
            onStep={(delta) => onStepAngle('y', delta, -180, 180)}
          />

          <AngleSlider
            label="Tilt (X)"
            value={rotX}
            displayValue={`${rotX}°`}
            min={-90}
            max={90}
            onChange={(val) => onAngleChange('x', val)}
            onStep={(delta) => onStepAngle('x', delta, -90, 90)}
          />

          <AngleSlider
            label="Roll (Z)"
            value={rotZ}
            displayValue={`${rotZ}°`}
            min={-180}
            max={180}
            onChange={(val) => onAngleChange('z', val)}
            onStep={(delta) => onStepAngle('z', delta, -180, 180)}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border/60 mt-auto">
        <Button
          className="w-full h-12 rounded-xl shadow-lg font-semibold text-xs tracking-wide transition-all duration-200 active:scale-[0.98]"
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
