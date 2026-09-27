// Applies the order of a reordered subset (one category tab, or search results)
// to the full list: the subset's items move between the slots they already
// occupy, and every other item keeps its position.
export function mergeOrder(all, reorderedSubset) {
    const ids = new Set(reorderedSubset.map((item) => item.id));
    const queue = [...reorderedSubset];
    return all.map((item) => (ids.has(item.id) ? queue.shift() : item));
}
