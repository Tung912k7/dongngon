import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export function getRealIp(headers: Headers | ReadonlyHeaders): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip && isValidIp(ip)) {
      return ip;
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) {
    return realIp;
  }

  return "unknown";
}

function isValidIp(ip: string): boolean {
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  // Basic IPv6 validation
  const ipv6Regex = /^[a-fA-F0-9:]+$/;

  if (ipv4Regex.test(ip)) {
    // Check if parts are <= 255
    const parts = ip.split(".");
    return parts.every((part) => parseInt(part, 10) <= 255);
  }

  if (ipv6Regex.test(ip) && ip.includes(":")) {
    return true;
  }

  return false;
}
