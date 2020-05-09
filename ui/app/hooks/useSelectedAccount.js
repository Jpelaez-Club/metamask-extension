import { useSelector } from 'react-redux'
import { getSelectedAddress } from '../selectors/selectors'

export function useSelectedAccount () {
  const accounts = useSelector((state) => state.metamask.accounts)
  const selectedAddress = useSelector(getSelectedAddress)
  return accounts[selectedAddress]
}
