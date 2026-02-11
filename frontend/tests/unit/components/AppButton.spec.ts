import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import AppButton from '~/components/common/AppButton.vue'

describe('AppButton.vue', () => {
  it('renders a button', () => {
    const wrapper = mount(AppButton)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mount(AppButton, {
      slots: {
        default: 'Click me'
      }
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('applies the correct variant class for secondary', async () => {
    const wrapper = mount(AppButton, {
      props: {
        variant: 'secondary'
      }
    })
    // Check for one of the specific Tailwind classes
    expect(wrapper.find('button').classes()).toContain('bg-gray-600')
  })

  it('applies the correct variant class for danger', async () => {
    const wrapper = mount(AppButton, {
        props: {
            variant: 'danger'
        }
    })
    // Check for one of the specific Tailwind classes
    expect(wrapper.find('button').classes()).toContain('bg-red-600')
  })


  it('disables the button with the disabled prop', async () => {
    const wrapper = mount(AppButton, {
      props: {
        disabled: true
      }
    })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('disables the button and shows a spinner when loading', async () => {
    const wrapper = mount(AppButton, {
      props: {
        loading: true
      },
      slots: {
        default: 'I should not be visible'
      }
    })
    // The button should be disabled
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    // A svg spinner should be present
    expect(wrapper.find('svg').exists()).toBe(true)
    // The default slot content should NOT be visible
    expect(wrapper.text()).not.toContain('I should not be visible')
  })

  it('emits a click event when not disabled', async () => {
    const wrapper = mount(AppButton)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted().click).toBeTruthy()
    expect(wrapper.emitted().click.length).toBe(1)
  })

  it('does not emit a click event when disabled', async () => {
    const wrapper = mount(AppButton, {
      props: {
        disabled: true
      }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted().click).toBeFalsy()
  })
}) 