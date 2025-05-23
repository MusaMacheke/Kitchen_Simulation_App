"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import type { Dish } from "@/lib/types"

interface RealTimeTimerProps {
  dish: Dish
}

export function RealTimeTimer({ dish }: RealTimeTimerProps) {
  const [progress, setProgress] = useState(dish.progress || 0)
  const [remainingTime, setRemainingTime] = useState(0)

  useEffect(() => {
    if (dish.status !== "preparing" || !dish.startTime || !dish.endTime) {
      return
    }

    const updateProgress = () => {
      const now = new Date()
      const totalDuration = dish.endTime!.getTime() - dish.startTime!.getTime()
      const elapsed = now.getTime() - dish.startTime!.getTime()
      const remaining = Math.max(0, dish.endTime!.getTime() - now.getTime())

      const currentProgress = Math.min(100, (elapsed / totalDuration) * 100)
      setProgress(Math.round(currentProgress))
      setRemainingTime(Math.ceil(remaining / 1000))
    }

    // Initial update
    updateProgress()

    // Update every 100ms for smooth progress
    const interval = setInterval(updateProgress, 100)

    return () => clearInterval(interval)
  }, [dish])

  if (dish.status !== "preparing") {
    return null
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Preparing...</span>
        <span>{remainingTime}s remaining</span>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  )
}
