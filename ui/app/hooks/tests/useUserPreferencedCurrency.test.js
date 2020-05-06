import assert from 'assert'
import { renderHook } from '@testing-library/react-hooks'
import { useUserPreferencedCurrency } from '../useUserPreferencedCurrency'
import * as reactRedux from 'react-redux'
import { preferencesSelector, getShouldShowFiat } from '../../selectors'
import sinon from 'sinon'

const tests = [
  {
    state: {
      useNativeCurrencyAsPrimaryCurrency: true,
      nativeCurrency: 'ETH',
      showFiat: true,
    },
    params: {
      type: 'PRIMARY',
    },
    result: {
      currency: 'ETH',
      numberOfDecimals: 6,
    },
  },
  {
    state: {
      useNativeCurrencyAsPrimaryCurrency: false,
      nativeCurrency: 'ETH',
      showFiat: true,
    },
    params: {
      type: 'PRIMARY',
    },
    result: {
      currency: undefined,
      numberOfDecimals: 2,
    },
  },
  {
    state: {
      useNativeCurrencyAsPrimaryCurrency: true,
      nativeCurrency: 'ETH',
      showFiat: true,
    },
    params: {
      type: 'SECONDARY',
      fiatNumberOfDecimals: 4,
      fiatPrefix: '-',
    },
    result: {
      currency: undefined,
      numberOfDecimals: 4,
    },
  },
  {
    state: {
      useNativeCurrencyAsPrimaryCurrency: false,
      nativeCurrency: 'ETH',
      showFiat: true,
    },
    params: {
      type: 'SECONDARY',
      fiatNumberOfDecimals: 4,
      numberOfDecimals: 3,
      fiatPrefix: 'a',
    },
    result: {
      currency: 'ETH',
      numberOfDecimals: 3,
    },
  },
  {
    state: {
      useNativeCurrencyAsPrimaryCurrency: false,
      nativeCurrency: 'ETH',
      showFiat: false,
    },
    params: {
      type: 'PRIMARY',
    },
    result: {
      currency: 'ETH',
      numberOfDecimals: 6,
    },
  },
  {
    state: {
      useNativeCurrencyAsPrimaryCurrency: false,
      nativeCurrency: 'ETH',
      showFiat: true,
    },
    params: {
      type: 'PRIMARY',
    },
    result: {
      currency: undefined,
      numberOfDecimals: 2,
    },
  },
  {
    state: {
      useNativeCurrencyAsPrimaryCurrency: false,
      nativeCurrency: 'ETH',
      showFiat: true,
    },
    params: {
      type: 'PRIMARY',
    },
    result: {
      currency: undefined,
      numberOfDecimals: 2,
    },
  },
]

function getFakeUseSelector (state) {
  return (selector) => {
    if (selector === preferencesSelector) {
      return state
    } else if (selector === getShouldShowFiat) {
      return state.showFiat
    } else {
      return state.nativeCurrency
    }
  }
}


describe('useUserPreferencedCurrency', function () {
  it('should return currency and decimals based on user preference', function () {
    tests.forEach(({ params: { type, ...otherParams }, state, result }) => {
      const stub = sinon.stub(reactRedux, 'useSelector')
      stub.callsFake(getFakeUseSelector(state))

      const { result: hookResult } = renderHook(() => useUserPreferencedCurrency(type, otherParams))
      stub.restore()
      assert.deepEqual(hookResult.current, result)
    })
  })
})
