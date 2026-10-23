/** A value that is only digits: a hop count. */
const HOP_COUNT = /^\d+$/;

/**
 * Read which reverse proxies a deployment names, for Fastify's `trustProxy`.
 *
 * Behind a proxy, `request.ip` is the proxy's address on every request and
 * `request.protocol` reads `http` for an HTTPS client, so the variable names the
 * proxy whose `X-Forwarded-For` is believed: an address, a CIDR range, or a
 * comma-separated list of either. `true` believes any peer, which is only safe
 * when the port is unreachable except through the proxy.
 *
 * A hop count is refused. Fastify 5.12.7 and later trust nothing for a number,
 * since a hop count cannot tell the proxy from a client, so the service would
 * silently log the proxy's address again — and a function over the hop, the
 * usual way around it, believes any peer that sends enough addresses.
 * @param value - `TRUST_PROXY`, as written.
 * @returns The proxies as written, `true` to believe any peer, or `false` when
 * the variable is unset, blank or `false`.
 * @throws {Error} When the value is a hop count.
 */
export function parseTrustProxy(value: string | undefined): boolean | string {
  const text = value?.trim();
  if (!text || text.toLowerCase() === 'false') return false;
  if (text.toLowerCase() === 'true') return true;
  if (HOP_COUNT.test(text)) {
    throw new Error(
      `TRUST_PROXY=${text} is a hop count, which trusts nothing. Name the proxy's address or CIDR instead.`,
    );
  }
  return text;
}
