import React, { useMemo, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import {
  nonceSortedCompletedTransactionsSelector,
  nonceSortedPendingTransactionsSelector,
} from '../../../selectors/transactions'
import {
  getFeatureFlags,
} from '../../../selectors/selectors'
import * as actions from '../../../ducks/gas/gas.duck'
import { useI18nContext } from '../../../hooks/useI18nContext'
import TransactionListItem from '../transaction-list-item'

export default function TransactionList ({ isWideViewport = false } = {}) {
  const t = useI18nContext()

  const dispatch = useDispatch()
  const pendingTransactions = useSelector(nonceSortedPendingTransactionsSelector)
  const completedTransactions = useSelector(nonceSortedCompletedTransactionsSelector)
  // const selectedAddress = useSelector(getSelectedAddress)
  const { transactionTime: transactionTimeFeatureActive } = useSelector(getFeatureFlags)

  const { fetchGasEstimates, fetchBasicGasAndTimeEstimates } = useMemo(() => ({
    fetchGasEstimates: (blockTime) => dispatch(actions.fetchGasEstimates(blockTime)),
    fetchBasicGasAndTimeEstimates: () => dispatch(actions.fetchBasicGasAndTimeEstimates()),
  }), [dispatch])

  // keep track of previous values from state.
  // loaded is used here to determine if our effect has ran at least once.
  const prevState = useRef({ loaded: false, pendingTransactions, transactionTimeFeatureActive })

  useEffect(() => {
    const { loaded } = prevState.current
    const pendingTransactionAdded = pendingTransactions.length > 0 && prevState.current.pendingTransactions.length === 0
    const transactionTimeFeatureWasActivated = !prevState.current.transactionTimeFeatureActive && transactionTimeFeatureActive
    if (transactionTimeFeatureActive && pendingTransactions.length > 0 && (loaded === false || transactionTimeFeatureWasActivated || pendingTransactionAdded)) {
      fetchBasicGasAndTimeEstimates()
        .then(({ blockTime }) => fetchGasEstimates(blockTime))
    }
    prevState.current = { loaded: true, pendingTransactions, transactionTimeFeatureActive }
  }, [fetchGasEstimates, fetchBasicGasAndTimeEstimates, transactionTimeFeatureActive, pendingTransactions ])


  const pendingLength = pendingTransactions.length

  return (
    <div className="transaction-list">
      <div className="transaction-list__transactions">
        {
          pendingLength > 0 && (
            <div className="transaction-list__pending-transactions">
              <div className="transaction-list__header">
                { `${t('queue')} (${pendingTransactions.length})` }
              </div>
              {
                pendingTransactions.map((transactionGroup, index) => (
                  <TransactionListItem isEarliestNonce={index === 0} transactionGroup={transactionGroup} key={`${transactionGroup.nonce}:${index}`} />
                ))
              }
            </div>
          )
        }
        <div className="transaction-list__completed-transactions">
          {
            isWideViewport || pendingLength > 0
              ? (
                <div className="transaction-list__header">
                  { t('history') }
                </div>
              )
              : null
          }
          {
            completedTransactions.length > 0
              ? completedTransactions.map((transactionGroup, index) => (
                <TransactionListItem transactionGroup={transactionGroup} key={`${transactionGroup.nonce}:${index}`} />
              ))
              : (
                <div className="transaction-list__empty">
                  <div className="transaction-list__empty-text">
                    { t('noTransactions') }
                  </div>
                </div>
              )
          }
        </div>
      </div>
    </div>
  )
}

TransactionList.propTypes = {
  isWideViewport: PropTypes.bool.isRequired,
}
