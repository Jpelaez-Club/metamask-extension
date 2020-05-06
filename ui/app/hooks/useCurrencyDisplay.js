import { useMemo } from 'react'
import { getTokenValue, calcTokenAmount } from '../helpers/utils/token-util'
import { useSelector } from 'react-redux'
import { formatCurrency, getValueFromWeiHex } from '../helpers/utils/confirm-tx.util'

/**
 * Defines the shape for the Token input parameter for UseCurrencyOptions
 * @typedef {Object} Token
 * @property {string} symbol   - The string to use as a suffix for the token (eg. DAI)
 * @property {decimals} number - The number of decimals to show when displaying this type of token
 */

/**
 * Defines the shape of the options parameter for useCurrencyDisplay
 * @typedef {Object} UseCurrencyOptions
 * @property {token}  [Token] - When present changes the behavior to format the currency as the provided token
 * @property {string} [displayValue] - When present is used in lieu of formatting the inputValue
 * @property {string} [prefix] - String to prepend to the final result
 * @property {number} [numberOfDecimals] - Number of significant decimals to display
 * @property {string} [denomination] - Denomination (wei, gwei) to convert to for display
 * @property {string} [currency] - Currency type to convert to. This is an override of the user's nativeCurrency
 */

/**
 * Defines the return shape of the second value in the tuple
 * @typedef {Object} CurrencyDisplayParts
 * @property {string} [prefix]  - string to prepend to the value for display
 * @property {string} value     - string representing the value, formatted for display
 * @property {string} [suffix]  - string to append to the value for display
 */

/**
 * useCurrencyDisplay hook
 *
 * Given a hexadecimal encoded value string OR the decrypted data object from a token transaction,
 * and an object of parameters used for formatting the display, produce both a fully formed string
 * and the pieces of that string used for displaying the currency to the user
 * @param {string | Object} inputValue - The value to format for display
 * @param {UseCurrencyOptions} opts    - An object for options to format the inputValue
 * @return {[string, CurrencyDisplayParts]}
 */
export function useCurrencyDisplay (inputValue, { token, displayValue, prefix, numberOfDecimals, denomination, currency, ...opts }) {
  const { currentCurrency, nativeCurrency, conversionRate } = useSelector(
    ({ metamask: { currentCurrency, nativeCurrency, conversionRate } }) => ({ currentCurrency, nativeCurrency, conversionRate })
  )

  const toCurrency = currency || currentCurrency

  const value = useMemo(() => {
    if (typeof inputValue === 'object') {
      if (token === null) {
        throw new Error(
          `useCurrencyDisplay provided an inputValue that is an object, without a corresponding opts.token.
          To format a token for display provide the token object in the options object`
        )
      }
      if ((inputValue?.params?.length || 0) === 0) {
        throw new Error(
          `useCurrencyDisplay provided an object without params. Only use this hook with decoded tokenData, or a value string`
        )
      }
      const tokenValue = getTokenValue(inputValue.params)
      return calcTokenAmount(tokenValue, token.decimals).toString()

    }
    if (displayValue) {
      return displayValue
    }
    return formatCurrency(
      getValueFromWeiHex({
        value: inputValue,
        fromCurrency: nativeCurrency,
        toCurrency,
        conversionRate,
        numberOfDecimals: numberOfDecimals || 2,
        toDenomination: denomination,
      }),
      toCurrency
    )
  }, [token, inputValue, nativeCurrency, conversionRate, displayValue, numberOfDecimals, denomination, toCurrency])

  const suffix = token != null ? token.symbol : opts.hideLabel ? undefined : opts.suffix ? opts.suffix : toCurrency.toUpperCase()

  return [`${prefix || ''}${value}${suffix ? ' ' + suffix : ''}`, { prefix, value, suffix }]
}
