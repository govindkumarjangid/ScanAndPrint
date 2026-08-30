/**
 * Calculates non-overlapping position & dimensions (% of A4 canvas)
 * for N images so they fit on the A4 page without overlapping!
 */
export function getNonOverlappingSlot(index, totalCount) {
  if (totalCount <= 1) {
    return { x: 7, y: 6, width: 86, height: 86 }
  }
  if (totalCount === 2) {
    // 2 Items: Top Half & Bottom Half (Zero overlap!)
    return index === 0
      ? { x: 7, y: 4, width: 86, height: 44 }
      : { x: 7, y: 52, width: 86, height: 44 }
  }
  if (totalCount === 3) {
    // 3 Items: 1 Top, 2 Bottom side-by-side (Zero overlap!)
    if (index === 0) return { x: 7, y: 4, width: 86, height: 44 }
    if (index === 1) return { x: 5, y: 52, width: 43, height: 44 }
    return { x: 52, y: 52, width: 43, height: 44 }
  }
  if (totalCount === 4) {
    // 4 Items: 2x2 Grid (Zero overlap!)
    const col = index % 2
    const row = Math.floor(index / 2)
    return {
      x: col === 0 ? 5 : 52,
      y: row === 0 ? 4 : 52,
      width: 43,
      height: 44,
    }
  }
  // 5 Items: 2 Top, 3 Bottom (Zero overlap!)
  if (index < 2) {
    return {
      x: index === 0 ? 5 : 52,
      y: 4,
      width: 43,
      height: 44,
    }
  } else {
    const col3 = index - 2
    return {
      x: 4 + col3 * 32,
      y: 52,
      width: 28,
      height: 44,
    }
  }
}
