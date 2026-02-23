import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { forms } from '../../config/forms'

interface BookingCalendarProps {
  onSelect: (date: string) => void
  selectedDate: string | null
  blockedDays?: number[]
  maxDaysOut?: number
}

/** Format a Date as yyyy-mm-dd (local timezone). */
function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Pretty label for screen readers: "Monday, March 15, 2026". */
function ariaDateLabel(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** Get a local Date from yyyy-mm-dd without timezone offset. */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Strip time from a Date for comparison. */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function BookingCalendar({
  onSelect,
  selectedDate,
  blockedDays = forms.booking.blockedDays,
  maxDaysOut = forms.booking.maxDaysOut,
}: BookingCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const maxDate = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() + maxDaysOut)
    return d
  }, [today, maxDaysOut])

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [focusedDate, setFocusedDate] = useState<string>(
    selectedDate ?? toISO(today)
  )

  const gridRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  /** Register a cell ref by ISO key. */
  const setCellRef = useCallback(
    (iso: string) => (el: HTMLButtonElement | null) => {
      if (el) cellRefs.current.set(iso, el)
      else cellRefs.current.delete(iso)
    },
    []
  )

  /** Build the grid of dates for the current view month. */
  const weeks = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const startDow = first.getDay() // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const rows: Date[][] = []
    let row: Date[] = []

    // Leading blanks from previous month
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
    for (let i = startDow - 1; i >= 0; i--) {
      row.push(new Date(viewYear, viewMonth - 1, prevMonthDays - i))
    }

    for (let d = 1; d <= daysInMonth; d++) {
      row.push(new Date(viewYear, viewMonth, d))
      if (row.length === 7) {
        rows.push(row)
        row = []
      }
    }

    // Trailing blanks from next month
    if (row.length > 0) {
      let nextDay = 1
      while (row.length < 7) {
        row.push(new Date(viewYear, viewMonth + 1, nextDay++))
      }
      rows.push(row)
    }

    return rows
  }, [viewYear, viewMonth])

  /** Check if a date is disabled. */
  const isDisabled = useCallback(
    (d: Date): boolean => {
      if (d < today) return true
      if (d > maxDate) return true
      if (blockedDays.includes(d.getDay())) return true
      return false
    },
    [today, maxDate, blockedDays]
  )

  /** Check if date is outside the current view month. */
  const isOutsideMonth = useCallback(
    (d: Date): boolean => d.getMonth() !== viewMonth || d.getFullYear() !== viewYear,
    [viewMonth, viewYear]
  )

  /** Navigate months. */
  const changeMonth = useCallback(
    (delta: number) => {
      let newMonth = viewMonth + delta
      let newYear = viewYear
      if (newMonth < 0) {
        newMonth = 11
        newYear--
      } else if (newMonth > 11) {
        newMonth = 0
        newYear++
      }
      setViewMonth(newMonth)
      setViewYear(newYear)
    },
    [viewMonth, viewYear]
  )

  /** Whether we can navigate to previous month. */
  const canGoPrev = useMemo(() => {
    const prevLast = new Date(viewYear, viewMonth, 0)
    return prevLast >= today
  }, [viewYear, viewMonth, today])

  /** Whether we can navigate to next month. */
  const canGoNext = useMemo(() => {
    const nextFirst = new Date(viewYear, viewMonth + 1, 1)
    return nextFirst <= maxDate
  }, [viewYear, viewMonth, maxDate])

  /** Move focus to an adjacent date, skipping disabled dates. */
  const moveFocus = useCallback(
    (from: Date, dayDelta: number) => {
      let next = new Date(from)
      // Move in the given direction, skipping disabled dates (up to 60 attempts)
      for (let attempt = 0; attempt < 60; attempt++) {
        next = new Date(next.getFullYear(), next.getMonth(), next.getDate() + dayDelta)
        if (next < today || next > maxDate) return // out of range, don't move
        if (!isDisabled(next)) {
          const iso = toISO(next)
          // If the date is in a different month, change the view
          if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
            setViewMonth(next.getMonth())
            setViewYear(next.getFullYear())
          }
          setFocusedDate(iso)
          return
        }
      }
    },
    [today, maxDate, isDisabled, viewMonth, viewYear]
  )

  /** Home: move to start of week (Sunday). End: move to end of week (Saturday). */
  const moveToWeekBound = useCallback(
    (from: Date, direction: 'start' | 'end') => {
      const dow = from.getDay()
      const delta = direction === 'start' ? -dow : 6 - dow
      if (delta === 0) return
      const target = new Date(from.getFullYear(), from.getMonth(), from.getDate() + delta)
      if (target < today || target > maxDate) return
      if (!isDisabled(target)) {
        const iso = toISO(target)
        if (target.getMonth() !== viewMonth || target.getFullYear() !== viewYear) {
          setViewMonth(target.getMonth())
          setViewYear(target.getFullYear())
        }
        setFocusedDate(iso)
      }
    },
    [today, maxDate, isDisabled, viewMonth, viewYear]
  )

  /** Focus the correct button when focusedDate changes. */
  useEffect(() => {
    const el = cellRefs.current.get(focusedDate)
    if (el && document.activeElement && gridRef.current?.contains(document.activeElement)) {
      el.focus()
    }
  }, [focusedDate])

  /** Keyboard handler for the grid. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const current = parseISO(focusedDate)
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          moveFocus(current, -1)
          break
        case 'ArrowRight':
          e.preventDefault()
          moveFocus(current, 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          moveFocus(current, -7)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveFocus(current, 7)
          break
        case 'Home':
          e.preventDefault()
          moveToWeekBound(current, 'start')
          break
        case 'End':
          e.preventDefault()
          moveToWeekBound(current, 'end')
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (!isDisabled(current)) {
            onSelect(focusedDate)
          }
          break
      }
    },
    [focusedDate, moveFocus, moveToWeekBound, isDisabled, onSelect]
  )

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      {/* Header: prev / month label / next */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="p-1.5 rounded-lg hover:bg-navy/5 text-navy disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-navy" aria-live="polite">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          disabled={!canGoNext}
          aria-label="Next month"
          className="p-1.5 rounded-lg hover:bg-navy/5 text-navy disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-1" role="row">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-medium text-text-secondary py-1"
            role="columnheader"
            aria-label={name}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div ref={gridRef} role="grid" aria-label={`Calendar - ${monthLabel}`} onKeyDown={handleKeyDown}>
        {weeks.map((week, wi) => (
          <div key={wi} role="row" className="grid grid-cols-7">
            {week.map((day) => {
              const iso = toISO(day)
              const disabled = isDisabled(day)
              const outside = isOutsideMonth(day)
              const isToday = iso === toISO(today)
              const isSelected = iso === selectedDate
              const isFocused = iso === focusedDate

              return (
                <div key={iso} role="gridcell">
                  <button
                    ref={setCellRef(iso)}
                    type="button"
                    tabIndex={isFocused ? 0 : -1}
                    disabled={disabled || outside}
                    aria-label={ariaDateLabel(day)}
                    aria-selected={isSelected || undefined}
                    aria-disabled={disabled || outside || undefined}
                    onClick={() => {
                      if (!disabled && !outside) {
                        setFocusedDate(iso)
                        onSelect(iso)
                      }
                    }}
                    onFocus={() => {
                      if (!disabled && !outside) setFocusedDate(iso)
                    }}
                    className={[
                      'w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all',
                      // Outside month
                      outside && 'invisible',
                      // Disabled
                      disabled && !outside && 'text-gray-300 cursor-not-allowed',
                      // Selected
                      isSelected && !disabled && 'bg-brand-blue text-white font-semibold',
                      // Today ring (when not selected)
                      isToday && !isSelected && !disabled && 'ring-1 ring-brand-blue text-brand-blue font-medium',
                      // Available (not selected, not today, not disabled)
                      !isSelected && !isToday && !disabled && !outside && 'text-navy hover:bg-brand-blue/10 cursor-pointer',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {day.getDate()}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
