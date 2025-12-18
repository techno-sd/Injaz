import { cn, formatDate, formatDateTime, debounce } from '../lib/utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500') // tailwind-merge should keep the last one
  })
})

describe('formatDate', () => {
  it('formats date objects correctly', () => {
    const date = new Date('2023-12-25')
    expect(formatDate(date)).toBe('Dec 25, 2023')
  })

  it('formats date strings correctly', () => {
    expect(formatDate('2023-12-25')).toBe('Dec 25, 2023')
  })
})

describe('formatDateTime', () => {
  it('formats date and time correctly', () => {
    const date = new Date('2023-12-25T14:30:00')
    expect(formatDateTime(date)).toBe('Dec 25, 2023, 2:30 PM')
  })
})

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('delays function execution', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 1000)

    debouncedFn()
    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1000)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('resets delay on subsequent calls', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 1000)

    debouncedFn()
    jest.advanceTimersByTime(500)
    debouncedFn()
    jest.advanceTimersByTime(500)
    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(500)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})