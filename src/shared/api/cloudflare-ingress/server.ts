import "server-only";

import { timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

function ipv6Words(address: string) {
  let hexadecimal = address.toLowerCase();
  if (hexadecimal.includes(".")) {
    const lastColon = hexadecimal.lastIndexOf(":");
    const octets = hexadecimal
      .slice(lastColon + 1)
      .split(".")
      .map(Number);
    hexadecimal = `${hexadecimal.slice(0, lastColon + 1)}${((octets[0] << 8) | octets[1]).toString(16)}:${((octets[2] << 8) | octets[3]).toString(16)}`;
  }
  const [left, right] = hexadecimal.split("::");
  const start = left ? left.split(":").map((word) => parseInt(word, 16)) : [];
  if (right === undefined) return start;
  const end = right ? right.split(":").map((word) => parseInt(word, 16)) : [];
  return [...start, ...Array<number>(8 - start.length - end.length).fill(0), ...end];
}

function compressIpv6(words: number[]) {
  let longestStart = -1;
  let longestLength = 1;
  for (let index = 0; index < words.length;) {
    if (words[index] !== 0) {
      index += 1;
      continue;
    }
    const start = index;
    while (index < words.length && words[index] === 0) index += 1;
    if (index - start > longestLength) {
      longestStart = start;
      longestLength = index - start;
    }
  }
  const hexadecimal = words.map((word) => word.toString(16));
  if (longestStart === -1) return hexadecimal.join(":");
  return `${hexadecimal.slice(0, longestStart).join(":")}::${hexadecimal.slice(longestStart + longestLength).join(":")}`;
}

export function normalizeClientIp(header: string | null) {
  if (header === null) throw new Error("INGRESS_UNAVAILABLE");
  const address = header.replace(/^ +| +$/g, "");
  if (!address || /[\s,\[\]%]/u.test(address)) throw new Error("INGRESS_UNAVAILABLE");
  const family = isIP(address);
  if (family === 4) return `v4:${address}`;
  if (family !== 6) throw new Error("INGRESS_UNAVAILABLE");
  const words = ipv6Words(address);
  if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
    return `v4:${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`;
  }
  return `v6:${compressIpv6(words)}`;
}


interface CloudflareIngressOptions {
  secret: string | undefined;
  keyHeader: string;
  ipHeader: string;
}

export function authenticateCloudflareIp(headers: Headers, options: CloudflareIngressOptions) {
  const supplied = headers.get(options.keyHeader);
  const expected = options.secret;
  if (!supplied || !expected || supplied.length !== 64 || expected.length !== 64 || !/^[a-f0-9]{64}$/.test(supplied) || !/^[a-f0-9]{64}$/.test(expected) ||
    !timingSafeEqual(Buffer.from(supplied, "ascii"), Buffer.from(expected, "ascii")) || headers.has("cf-worker")) {
    throw new Error("INGRESS_UNAVAILABLE");
  }
  return normalizeClientIp(headers.get(options.ipHeader));
}
