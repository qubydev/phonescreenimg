'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const presetButtons = [
  { label: 'Front', action: 'setFront' },
  { label: 'Back', action: 'setBack' },
  { label: 'Left', action: 'setLeft' },
  { label: 'Right', action: 'setRight' },
  { label: 'Top', action: 'setTop' },
  { label: 'Bottom', action: 'setBottom' },
]

export default function ViewerControls({ viewerRef }) {
  const [format, setFormat] = useState('png')

  const handlePreset = (action) => {
    viewerRef.current?.[action]?.()
  }

  const handleReset = () => {
    viewerRef.current?.resetView?.()
  }

  const handleExport = () => {
    const dataUrl = viewerRef.current?.capture?.()
    if (!dataUrl) return

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `iphone_17_pro_max.${format}`
    link.click()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Preset Angles */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2.5">Camera Angles</h3>
        <div className="grid grid-cols-3 gap-2">
          {presetButtons.map(({ label, action }) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => handlePreset(action)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="w-full"
      >
        <RotateCcw className="size-3.5 mr-1.5" />
        Reset View
      </Button>

      {/* Export */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-foreground mb-2.5">Export Image</h3>
        <div className="flex gap-1.5 mb-3">
          {['png', 'jpeg'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={cn(
                'flex-1 px-2.5 py-1.5 text-xs rounded-md border transition-colors',
                format === fmt
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              )}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="w-full"
          onClick={handleExport}
        >
          <Download className="size-3.5 mr-1.5" />
          Export as {format.toUpperCase()}
        </Button>
      </div>
    </div>
  )
}
