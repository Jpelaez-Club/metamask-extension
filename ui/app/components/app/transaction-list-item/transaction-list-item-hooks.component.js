import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import ListItem from '../../ui/list-item'
import { useTransactionDisplayData } from '../../../hooks/useTransactionDisplayData'
import Approve from '../../ui/icon/approve-icon.component'
import Interaction from '../../ui/icon/interaction-icon.component'
import Receive from '../../ui/icon/receive-icon.component'
import Preloader from '../../ui/icon/preloader'
import Send from '../../ui/icon/send-icon.component'
import { useI18nContext } from '../../../hooks/useI18nContext'
import { useCancelTransaction } from '../../../hooks/useCancelTransaction'
import { useRetryTransaction } from '../../../hooks/useRetryTransaction'
import Button from '../../ui/button'
import Tooltip from '../../ui/tooltip'


export default function TransactionListItem ({ transactionGroup }) {
  const t = useI18nContext()
  const { hasCancelled } = transactionGroup

  const [cancelEnabled, cancelTransaction] = useCancelTransaction(transactionGroup)
  const retryTransaction = useRetryTransaction(transactionGroup)

  const { title, subtitle, category, primaryCurrency, secondaryCurrency, status } = useTransactionDisplayData(transactionGroup)

  const isApprove = category === 'approval'
  const isSend = category === 'send'
  const isReceive = category === 'deposit'
  const isUnapproved = status === 'unapproved'
  const isPending = status === 'pending'
  const isFailed = status === 'failed'

  const color = isFailed ? '#D73A49' : '#2F80ED'

  let Icon = Interaction
  if (isApprove) {
    Icon = Approve
  } else if (isSend) {
    Icon = Send
  } else if (isReceive) {
    Icon = Receive
  }

  let subtitleStatus = null
  if (isUnapproved) {
    subtitleStatus = (
      <span><span className="transaction-list-item__status--unapproved">{t('unapproved')}</span> · </span>
    )
  } else if (isFailed) {
    subtitleStatus = (
      <span><span className="transaction-list-item__status--failed">{t('failed')}</span> · </span>
    )
  }

  const className = classnames('transaction-list-item', { 'transaction-list-item--pending': isPending })

  const cancelButton = useMemo(() => {
    const cancelButton = (
      <Button
        onClick={cancelTransaction}
        className="transaction-list-item__header-button"
        disabled={!cancelEnabled}
      >
        { t('cancel') }
      </Button>
    )
    if (hasCancelled) {
      return null
    }

    return !cancelEnabled ? (
      <Tooltip title={t('notEnoughGas')}>
        <div>
          {cancelButton}
        </div>
      </Tooltip>
    ) : cancelButton

  }, [cancelEnabled, cancelTransaction, hasCancelled])

  const speedUpButton = useMemo(() => {
    return (
      <Button
        type="secondary"
        onClick={retryTransaction}
        className="transaction-list-item-details__header-button"
      >
        { t('speedUp') }
      </Button>
    )
  }, [retryTransaction])

  return (
    <ListItem
      className={className}
      title={title}
      titleIcon={isPending && (
        <Preloader
          size={16}
          color="#D73A49"
        />
      )}
      Icon={Icon}
      iconColor={color}
      subtitle={subtitle}
      subtitleStatus={subtitleStatus}
      rightContent={(
        <>
          <h2 className="transaction-list-item__primaryCurrency">{primaryCurrency}</h2>
          <h3 className="transaction-list-item__secondaryCurrency">{secondaryCurrency}</h3>
        </>
      )}
    >
      {true && (
        <div className="transaction-list-item__pendingActions">
          {speedUpButton}
          {cancelButton}
        </div>
      )}
    </ListItem>
  )
}

TransactionListItem.propTypes = {
  transactionGroup: PropTypes.object.isRequired,
}
