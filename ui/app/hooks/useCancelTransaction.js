import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { showModal } from '../store/actions'
import { isBalanceSufficient } from '../pages/send/send.utils'
import { getHexGasTotal, increaseLastGasPrice } from '../helpers/utils/confirm-tx.util'
import { useSelectedAccount } from './useSelectedAccount'
import { conversionRateSelector } from '../selectors'

/**
 * useCancelTransaction
 *
 * Provides a reusable hook that, given a transactionGroup, will return
 * whether or not the account has enough funds to cover the gas cancellation
 * fee, and a method for beginning the cancellation process
 * @param {Object} transactionGroup
 */
export function useCancelTransaction (transactionGroup) {
  const dispatch = useDispatch()
  const selectedAccount = useSelectedAccount()
  const conversionRate = useSelector(conversionRateSelector)
  const showCancelModal = useCallback((transactionId, originalGasPrice) => {
    return dispatch(showModal({ name: 'CANCEL_TRANSACTION', transactionId, originalGasPrice }))
  }, [dispatch])
  const { primaryTransaction, initialTransaction } = transactionGroup
  const gasPrice = primaryTransaction.txParams.gasPrice
  const id = initialTransaction.id

  const hasEnoughCancelGas = primaryTransaction.txParams && isBalanceSufficient({
    amount: '0x0',
    gasTotal: getHexGasTotal({
      gasPrice: increaseLastGasPrice(primaryTransaction.txParams.gasPrice),
      gasLimit: primaryTransaction.txParams.gas,
    }),
    balance: selectedAccount.balance,
    conversionRate,
  })

  const cancelTransaction = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()

    showCancelModal(id, gasPrice)
  }, [id, gasPrice, showCancelModal])

  return [hasEnoughCancelGas, cancelTransaction]
}
