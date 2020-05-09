import { useDispatch } from 'react-redux'
import { useMemo, useCallback } from 'react'
import * as actions from '../store/actions'
import {
  fetchBasicGasAndTimeEstimates as fetchBasicGasAndTimeEstimatesAction,
  fetchGasEstimates as fetchGasEstimatesAction,
  setCustomGasPriceForRetry as setCustomGasPriceForRetryAction,
  setCustomGasLimit as setCustomGasLimitAction,
} from '../ducks/gas/gas.duck'
import { TOKEN_METHOD_TRANSFER } from '../helpers/constants/transactions'
import { increaseLastGasPrice } from '../helpers/utils/confirm-tx.util'
import { useMetricEvent } from './useMetricEvent'
import { useMethodData } from './useMethodData'

export function useRetryTransaction (transactionGroup, isEarliestNonce = false) {
  const { primaryTransaction, transactions, initialTransaction, hasRetried } = transactionGroup
  const [earliestTransaction = {}] = transactions
  const { submittedTime } = earliestTransaction
  const { txParams: { gasPrice } } = primaryTransaction
  const methodData = useMethodData(primaryTransaction.txParams.data)
  const trackMetricsEvent = useMetricEvent(({
    eventOpts: {
      category: 'Navigation',
      action: 'Activity Log',
      name: 'Clicked "Speed Up"',
    },
  }))
  const dispatch = useDispatch()
  const { fetchBasicGasAndTimeEstimates, fetchGasEstimates, setSelectedToken, retryTransaction } = useMemo(() => ({
    fetchBasicGasAndTimeEstimates: () => dispatch(fetchBasicGasAndTimeEstimatesAction()),
    fetchGasEstimates: (blockTime) => dispatch(fetchGasEstimatesAction(blockTime)),
    setSelectedToken: (tokenAddress) => dispatch(actions.setSelectedToken(tokenAddress)),
    retryTransaction: () => {
      const transaction = initialTransaction
      const increasedGasPrice = increaseLastGasPrice(gasPrice)
      dispatch(setCustomGasPriceForRetryAction(increasedGasPrice || transaction.txParams.gasPrice))
      dispatch(setCustomGasLimitAction(transaction.txParams.gas))
      dispatch(actions.showSidebar({
        transitionName: 'sidebar-left',
        type: 'customize-gas',
        props: { transaction },
      }))
    },
  }), [dispatch, initialTransaction, gasPrice])

  if (methodData?.name === TOKEN_METHOD_TRANSFER) {
    setSelectedToken(initialTransaction.txParams.to)
  }

  const retryEnabled = Date.now() - submittedTime > 5000 && isEarliestNonce && !hasRetried


  const showRetryTransactionDialog = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()

    trackMetricsEvent()
    fetchBasicGasAndTimeEstimates()
      .then((basicEstimates) => fetchGasEstimates(basicEstimates.blockTime))
      .then(retryTransaction)
  }, [fetchBasicGasAndTimeEstimates, fetchGasEstimates, retryTransaction, trackMetricsEvent])
  return [retryEnabled, showRetryTransactionDialog]
}
