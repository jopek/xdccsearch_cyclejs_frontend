
export const sizeFormatter = sz => {
  const exp = b => Math.pow(2, b)
  let szf
  let szb

  const l2sz = Math.log(sz) / Math.log(2)

  if (l2sz < 10) {
      szb = 0
      szf = 'B'
  } else if (l2sz >= 10 && l2sz < 20) {
      szb = 10
      szf = 'KB'
  } else if (l2sz >= 20 && l2sz < 30) {
      szb = 20
      szf = 'MB'
  } else if (l2sz >= 30 && l2sz < 40) {
      szb = 30
      szf = 'GB'
  } else if (l2sz >= 40 && l2sz < 50) {
      szb = 40
      szf = 'TB'
  }

  const fixed = (sz / exp(szb)).toFixed(2)

  if (Math.ceil(fixed) - fixed > 0)
    return (sz / exp(szb)).toFixed(2) + ' ' + szf

  return Math.round(fixed) + ' ' + szf
}
