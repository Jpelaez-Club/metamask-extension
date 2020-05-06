import assert from 'assert'
import { renderHook } from '@testing-library/react-hooks'
import * as reactRedux from 'react-redux'
import { useCurrencyDisplay } from '../useCurrencyDisplay'
import sinon from 'sinon'

const tests = [
  {
    input: {
      value: '0x2386f26fc10000',
      numberOfDecimals: 2,
      currency: 'usd',
    },
    result: {
      value: '$2.80',
      suffix: 'USD',
      displayValue: '$2.80 USD',
    },
  },
  {
    input: {
      value: '0x2386f26fc10000',
      currency: 'usd',
    },
    result: {
      value: '$2.80',
      suffix: 'USD',
      displayValue: '$2.80 USD',
    },
  },
  {
    input: {
      value: '0x1193461d01595930',
      currency: 'ETH',
      numberOfDecimals: 3,
    },
    result: {
      value: '1.266',
      suffix: 'ETH',
      displayValue: '1.266 ETH',
    },
  },
  {
    input: {
      value: '0x1193461d01595930',
      currency: 'ETH',
      numberOfDecimals: 3,
      hideLabel: true,
    },
    result: {
      value: '1.266',
      suffix: undefined,
      displayValue: '1.266',
    },
  },
  {
    input: {
      value: '0x3b9aca00',
      currency: 'ETH',
      denomination: 'GWEI',
      hideLabel: true,
    },
    result: {
      value: '1',
      suffix: undefined,
      displayValue: '1',
    },
  },
  {
    input: {
      value: '0x3b9aca00',
      currency: 'ETH',
      denomination: 'WEI',
      hideLabel: true,
    },
    result: {
      value: '1000000000',
      suffix: undefined,
      displayValue: '1000000000',
    },
  },
  {
    input: {
      value: '0x3b9aca00',
      currency: 'ETH',
      numberOfDecimals: 100,
      hideLabel: true,
    },
    result: {
      value: '0.000000001',
      suffix: undefined,
      displayValue: '0.000000001',
    },
  },
]


describe('useCurrencyDisplay', function () {
  it('Should renturn appropriate values', function () {
    tests.forEach(({ input: { value, ...restProps }, result }) => {
      const stub = sinon.stub(reactRedux, 'useSelector')
      stub.callsFake(() => ({
        currentCurrency: 'usd',
        nativeCurrency: 'ETH',
        conversionRate: 280.45,

      }))
      const hookReturn = renderHook(() => useCurrencyDisplay(value, restProps))
      stub.restore()
      const [ displayValue, parts ] = hookReturn.result.current
      assert.equal(parts.value, result.value)
      assert.equal(parts.suffix, result.suffix)
      assert.equal(displayValue, result.displayValue)
    })
  })
})
