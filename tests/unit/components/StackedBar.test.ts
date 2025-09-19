import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StackedBar from '~/components/stats/StackedBar.vue'

describe('StackedBar', () => {
  const mockProps = {
    percentage: 75,
    clicks: 15,
    uniqueVisitors: 8,
    day: '15',
    month: 'Jan',
    sources: [
      { id: 'website', count: 10, color: '#3b82f6', label: 'Website' },
      { id: 'direct', count: 5, color: '#6b7280', label: 'Direkt' }
    ]
  }

  it('sollte Balken mit korrekter Höhe rendern', () => {
    const wrapper = mount(StackedBar, { props: mockProps })
    const stack = wrapper.find('.stack')
    
    expect(stack.attributes('style')).toContain('height: 75%')
  })

  it('sollte leere Balken mit 2px Höhe rendern', () => {
    const emptyProps = { ...mockProps, clicks: 0, percentage: 0, sources: [] }
    const wrapper = mount(StackedBar, { props: emptyProps })
    const stack = wrapper.find('.stack')
    
    expect(stack.attributes('style')).toContain('height: 2px')
    expect(stack.classes()).toContain('empty')
  })

  it('sollte Source-Segmente korrekt rendern', () => {
    const wrapper = mount(StackedBar, { props: mockProps })
    const segments = wrapper.findAll('.segment')
    
    expect(segments).toHaveLength(2)
    
    // Website segment (10/15 = 66.67%)
    expect(segments[0]!.attributes('style')).toContain('height: 66.66666666666666%')
    expect(segments[0]!.attributes('style')).toContain('background-color: #3b82f6')
    expect(segments[0]!.attributes('title')).toBe('Website: 10')
    
    // Direct segment (5/15 = 33.33%)
    expect(segments[1]!.attributes('style')).toContain('height: 33.33333333333333%')
    expect(segments[1]!.attributes('style')).toContain('background-color: #6b7280')
    expect(segments[1]!.attributes('title')).toBe('Direkt: 5')
  })

  it('sollte Tooltip mit korrekten Informationen anzeigen', () => {
    const wrapper = mount(StackedBar, { props: mockProps })
    const stack = wrapper.find('.stack')
    
    expect(stack.attributes('title')).toBe('15: 15 Klicks gesamt, 8 unique Besucher')
  })

  it('sollte Tag-Label anzeigen', () => {
    const wrapper = mount(StackedBar, { props: mockProps })
    const dayLabel = wrapper.find('.label')
    
    expect(dayLabel.text()).toBe('15')
  })

  it('sollte Monats-Label anzeigen', () => {
    const wrapper = mount(StackedBar, { props: mockProps })
    const monthLabel = wrapper.find('.month')
    
    expect(monthLabel.text()).toBe('Jan')
  })

  it('sollte leere Labels korrekt handhaben', () => {
    const emptyLabelProps = { ...mockProps, day: '', month: '' }
    const wrapper = mount(StackedBar, { props: emptyLabelProps })
    
    const dayLabel = wrapper.find('.label')
    const monthLabel = wrapper.find('.month')
    
    expect(dayLabel.text()).toBe('')
    expect(monthLabel.text()).toBe('')
  })

  it('sollte Hover-Wert anzeigen', () => {
    const wrapper = mount(StackedBar, { props: mockProps })
    const value = wrapper.find('.value')
    
    expect(value.text()).toBe('15')
  })
})
