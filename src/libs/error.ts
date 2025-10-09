import type {
  AddressContainers,
  AddressVersions,
  ContextErrorDatas,
  IncorrectAddressErrorDatas,
  URLErrorDatas,
} from "./types.ts";

export function stringifyIncorrectAddress(
  version: AddressVersions,
  address: number[],
): string {
  if (version === 4) {
    return address.join(".");
  } else {
    return address.map((item) => item.toString(16)).join(":");
  }
}

function getStringOfAddressContainer(
  version: AddressVersions,
  container: AddressContainers,
): string {
  if (typeof container === "string") {
    return container;
  }

  if (Array.isArray(container)) {
    return stringifyIncorrectAddress(version, container);
  } else {
    return stringifyIncorrectAddress(version, Array.from(container));
  }
}

/**
 * Class representing an invalid error
 */
export class IncorrectAddressError extends Error {
  constructor(public readonly datas: IncorrectAddressErrorDatas) {
    super(IncorrectAddressError.getErrorMessage(datas));
  }

  static getErrorMessage(datas: IncorrectAddressErrorDatas): string {
    switch (datas.type) {
      case "incorrect-item":
        return "The item " + datas.item + " is incorrect in " +
          getStringOfAddressContainer(datas.version, datas.address);
      case "incorrect-format":
        return "The format is incorrect in address " +
          getStringOfAddressContainer(datas.version, datas.address);
      case "too-many-shortcuts":
        return "The IPv6 has too many shortcuts: " +
          getStringOfAddressContainer(6, datas.address);
      case "has-one-after-zero":
        return "The submask has a one after a zero: " +
          getStringOfAddressContainer(datas.version, datas.address);
      case "invalid-ipv6-tunneling":
        return getStringOfAddressContainer(6, datas.address) +
          " is not a valid " + datas.method + " IPv6 address";
      case "not-a-ipv6-tunneling":
        return getStringOfAddressContainer(6, datas.address) +
          " is not a IPv6 Tunneling";
      case "incorrect-zone-id":
        return "This zone id is not valid: " + datas.zoneId;
      case "incorrect-binary-string":
        return `"${datas.value}" is not a valid binary string in IPv${datas.version}`;
      case "ipv6-tunneling-mode-not-defined":
        return `${
          getStringOfAddressContainer(6, datas.address)
        } has not defined tunneling mode`;
      case "teredo-incorrect-flags":
        return `${datas.flags} is not a valid Teredo flag`;
      case "teredo-incorrect-port":
        return `${datas.port} is not a valid port`;
      default:
        return "Unknown error";
    }
  }
}
/**
 * Class representating an error in a network context
 */
export class ContextError extends Error {
  constructor(public readonly datas: ContextErrorDatas) {
    super(ContextError.getErrorMessage(datas));
  }

  static getErrorMessage(datas: ContextErrorDatas): string {
    switch (datas.type) {
      case "different-ip-versions":
        return "The IP versions of " + datas.addresses[0] + " and " +
          datas.addresses[1] + " are different";
      case "invalid-cidr":
        return "The cidr " + datas.cidr + " is not valid";
      case "ipv4-class-does-not-submask":
        return "The IPv4 class of " + datas.address + " doesn't have a submask";
      case "unknown-ip-version":
        return "The IP version of this params is unknown: " +
          JSON.stringify(datas.params);
      case "invalid-string-with-cidr":
        return "The string with cidr is not valid: " + datas.value;
      case "invalid-hosts-number":
        return "The hosts number is not valid: " + datas.value;
      default:
        return "Unknown error";
    }
  }
}

/**
 * This error is throwed if an URL is not valid
 */
export class URLError extends Error {
  constructor(public readonly datas: URLErrorDatas) {
    super();
  }
}

/**
 * This error is throwed if a static method is not defined in a subclass
 */
export class NonImplementedStaticMethodError extends Error {
  constructor() {
    super("This static method is not implemented");
  }
}
