"use client"

import { useEffect, useState } from "react"

type TimeParts = {
  years: number
  months: number
  weeks: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

const START_YEAR = 2025
const START_MONTH = 8 // 0-indexed (September)
const START_DAY = 3
const START_HOUR = 12 // 12:05 PM Vietnam time
const START_MINUTE = 5

function calculateTimeSince(start: Date, now: Date): TimeParts {
  // Work with calendar-aware years/months by advancing a temp pointer
  let temp = new Date(start.getTime())

  // Years
  let years = now.getFullYear() - start.getFullYear()
  temp.setFullYear(start.getFullYear() + years)
  if (temp > now) {
    years--
    temp.setFullYear(start.getFullYear() + years)
  }

  // Months
  let months = (now.getMonth() - temp.getMonth())
  if (months < 0) months += 12
  temp.setMonth(temp.getMonth() + months)
  if (temp > now) {
    months--
    temp.setMonth(temp.getMonth() - 1)
  }

  // Remaining difference in ms
  let remainingMs = now.getTime() - temp.getTime()

  const second = 1000
  const minute = 60 * second
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day

  const weeks = Math.floor(remainingMs / week)
  remainingMs -= weeks * week
  const days = Math.floor(remainingMs / day)
  remainingMs -= days * day
  const hours = Math.floor(remainingMs / hour)
  remainingMs -= hours * hour
  const minutes = Math.floor(remainingMs / minute)
  remainingMs -= minutes * minute
  const seconds = Math.floor(remainingMs / second)

  return { years, months, weeks, days, hours, minutes, seconds }
}

export default function TogetherTimer({ fontSizeClamp = 'clamp(36px, 12vw, 112px)' }: { fontSizeClamp?: string }) {
  // Create start date in Vietnam timezone (UTC+7)
  // September 3, 2025, 12:05 PM Vietnam time
  const vietnamStart = new Date('2025-09-03T12:05:00+07:00')
  
  const [parts, setParts] = useState<TimeParts>(() => calculateTimeSince(vietnamStart, new Date()))

  useEffect(() => {
    const id = setInterval(() => {
      setParts(calculateTimeSince(vietnamStart, new Date()))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const items: Array<{ label: string; value: number }> = [
    { label: 'years', value: parts.years },
    { label: 'months', value: parts.months },
    { label: 'weeks', value: parts.weeks },
    { label: 'days', value: parts.days },
    { label: 'hours', value: parts.hours },
    { label: 'minutes', value: parts.minutes },
    { label: 'seconds', value: parts.seconds },
  ]

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center font-handwriting text-black">
        {items.map((it) => (
          <div key={it.label} style={{ fontSize: fontSizeClamp, lineHeight: 1.05 }}>
            {it.value} {it.label}
          </div>
        ))}
      </div>
    </div>
  )
}


