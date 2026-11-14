type DecimalObj = { s?: number; e?: number; d?: number[] };

export function parseToDecimal(
  price: string | number | DecimalObj | any | null | undefined,
): number {
  if (price === null || price === undefined) return 0;
  if (typeof price === "number") return isNaN(price) ? 0 : price;
  if (typeof price === "string") {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof price === "object") {
    // 1. If it has a custom toString() method that returns a number string (e.g. Decimal.js instance)
    if (typeof price.toString === "function") {
      const str = price.toString();
      if (str && str !== "[object Object]") {
        const parsed = parseFloat(str);
        if (!isNaN(parsed)) return parsed;
      }
    }

    // 2. If it's a serialized Decimal.js object { s, e, d }
    if (price.d && Array.isArray(price.d) && price.d.length > 0) {
      if (price.e !== undefined && price.s !== undefined) {
        const digitsStr = price.d.join("");
        const exp = price.e;
        let numStr = digitsStr;
        if (exp >= 0) {
          if (exp + 1 >= digitsStr.length) {
            numStr = digitsStr + "0".repeat(exp + 1 - digitsStr.length);
          } else {
            numStr = digitsStr.slice(0, exp + 1) + "." + digitsStr.slice(exp + 1);
          }
        } else {
          numStr = "0." + "0".repeat(-exp - 1) + digitsStr;
        }
        const parsed = parseFloat(numStr) * (price.s < 0 ? -1 : 1);
        if (!isNaN(parsed)) return parsed;
      }

      const strVal = price.d.join("");
      const parsed = parseFloat(strVal);
      if (!isNaN(parsed)) return (price.s ?? 1) < 0 ? -parsed : parsed;
    }

    const high = price.d?.[0] ?? 0;
    const low = price.d?.[1] ?? 0;
    return (high + low / 1e7) * (price.s ?? 1);
  }
  return 0;
}

export function formatPrice(
  val: string | number | DecimalObj | any | null | undefined,
  decimals: number = 2
): string {
  const num = parseToDecimal(val);
  return num.toFixed(decimals);
}