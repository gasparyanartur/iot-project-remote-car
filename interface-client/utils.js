function dictApply(dict, keys, fn) {
    // Apply fn to each key of keys in dict and store the result as a dict value.
    // Return the dictionary formed by the resulting values. 

    const nd = {};
    keys.forEach(k => { nd[k] = fn(dict[k]); });
    return nd;
}