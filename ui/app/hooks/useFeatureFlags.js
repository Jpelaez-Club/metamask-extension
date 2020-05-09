import { useSelector } from 'react-redux'
import { getFeatureFlags } from '../selectors/selectors'

/**
 * useFeatureFlags
 *
 * @param {string[]} flags which flags from state to pull
 * @return {boolean[]}
 */
export function useFeatureFlags (flags) {
  const featureFlags = useSelector(getFeatureFlags)

  return flags.map((flag) => featureFlags[flag])
}
