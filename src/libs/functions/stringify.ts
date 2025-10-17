/**
 * stringify the IPv4 from the typed array representation
 * @param array IPv4 with typed array representation
 * @returns {string} IPv4 string representation
 */
export function stringifyIPv4Address(array: Uint8Array): string {
  return array.join(".");
}

/**
 * Search the max zero suite of this address typed array representation
 * @param address IPv6 address Uint16Array representation
 * @returns {[number,number] | null} [start,end] or null
 */
function searchMaxZeroSuite(address: Uint16Array): [number, number] | null {
  let res: [number, number] | null = null;
  let currentSuite: [number, number] | null = null;

  for (let index = 0; index < address.length; index++) {
    const item = address[index];
    if (currentSuite === null) {
      if (item === 0) {
        currentSuite = [index, index];
      }
    } else {
      if (item === 0) {
        currentSuite[1] = index;
      } else {
        if (res === null) {
          res = currentSuite;
        } else if (res[1] - res[0] < currentSuite[1] - currentSuite[0]) {
          res = currentSuite;
        }
        currentSuite = null;
      }
    }
  }

  if (
    currentSuite !== null &&
    (res === null || (res[1] - res[0] < currentSuite[1] - currentSuite[0]))
  ) {
    res = currentSuite;
  }

  return res;
}

/**
 * Stringify the IPv6 types array representation
 * @param address IPv6 Uint16Array representation
 * @returns {string} IPv6 string representation (for example: "2001:db::1")
 */
export function stringifyIPv6Address(address: Uint16Array): string {
  const skipIndexes = searchMaxZeroSuite(address);
  let index = 0;
  const res: string[] = [];

  while (index < address.length) {
    const item = address[index];
    if (skipIndexes === null || index !== skipIndexes[0]) {
      res.push(item.toString(16));
      index++;
    } else {
      if (skipIndexes[0] != 0) {
        res.push("");
      } else {
        res.push(":");
      }
      index = skipIndexes[1] + 1;
      if (skipIndexes[1] === 7) {
        res.push("");
      }
    }
  }

  return res.join(":");
}
