import { filter, fromPairs, isArray, keys, map } from 'lodash'

/**
 * merges 2 map info into 1,
 * if a field exists in both info and its values is array type, they will be concatenated
 * @param existing map info
 * @param incoming map info
 */
const mergeInfo = <T extends object>(existing: T, incoming: T): T => {
  const commonKeys = filter(
    keys(existing),
    key =>
      isArray((existing as any)[key]) &&
      keys(incoming).includes(key) &&
      isArray((incoming as any)[key]),
  )

  const common = fromPairs(
    map(commonKeys, key => [key, ((existing as any)[key] as any[]).concat((incoming as any)[key])]),
  )

  return Object.assign({}, existing, incoming, common)
}

export default mergeInfo
