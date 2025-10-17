import { isCorrectPort } from "./functions/check.ts";
import { URLError } from "./error.ts";
import { IPv4Address, type IPv6Address } from "./ipaddress/index.ts";

/**
 * Class representing an url with an [IPv4Address](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv4Address) or [IPv6Address](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv6Address)
 */
export class IPURL<IPAddress extends IPv4Address | IPv6Address> {
  protected _port?: number;

  constructor(
    /**
     * Address of the URL
     */
    readonly address: IPAddress,
    /**
     * Protocol (http,https,ftp,...)
     */
    public protocol?: string,
    /**
     * Port (for example: 80)
     */
    port?: number,
    /**
     * Pathname (for example: "demo")
     */
    public pathname?: string,
    /**
     * Search (for example: "hello")
     */
    public search?: string,
    /**
     * Hash (for example)
     */
    public hash?: string,
  ) {
    this.port = port;
  }

  /**
   * Get port
   */
  get port(): number | undefined {
    return this._port;
  }

  /**
   * Set port
   * @throws {URLError} The port is incorrect
   */
  set port(value: number | undefined) {
    if (value !== undefined && !isCorrectPort(value)) {
      throw new URLError({
        type: "invalid-port",
        port: value,
      });
    }
    this._port = value;
  }

  /**
   * Get the string URL
   *
   * @returns {string} string URL
   */
  toString(): string {
    return (this.protocol ? this.protocol + "://" : "") + (
      this.address instanceof IPv4Address
        ? (
          this.address.toString()
        )
        : (
          "[" + this.address.toString() + "]"
        )
    ) + (this.port ? ":" + this.port : "") +
      (this.pathname ? "/" + this.pathname : "") +
      (this.search ? "?" + this.search : "") +
      (this.hash ? "#" + this.hash : "");
  }
}
