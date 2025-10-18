import { IPv4Address, IPv6Address } from "@viviengraffin/ip-context";
import { ADDRESS_VERSIONS } from "../src/libs/const.ts";
import { arrayToUint } from "../src/libs/functions/uint.ts";

function benchMethods(name: string, address: IPv4Address | IPv6Address) {
  Deno.bench(name + ".toBinaryString: array implementation", () => {
    const { arrayLength, bitsByItem } = ADDRESS_VERSIONS[address.version];

    let res = "";

    for (let i = 0; i < arrayLength; i++) {
      res += address.array[i].toString(2).padStart(bitsByItem, "0");
    }
  });

  Deno.bench(name + ".toBinaryString: uint impelementation", () => {
    const { totalBits } = ADDRESS_VERSIONS[address.version];

    const uint = arrayToUint(address.version, address.array);
    uint.toString(2).padStart(totalBits, "0");
  });

  Deno.bench(name + ".toBinaryString: actual implementation", () => {
    address.toBinaryString();
  });

  Deno.bench(name + ".toHexString: array implementation", () => {
    const { arrayLength, bitsByItem } = ADDRESS_VERSIONS[address.version];
    const pad = bitsByItem / 4;
    let res = "";

    for (let i = 0; i < arrayLength; i++) {
      res += address.array[i].toString(16).padStart(pad, "0");
    }
  });

  Deno.bench(name + ".toHexString: uint implementation", () => {
    const { totalBits } = ADDRESS_VERSIONS[address.version];
    arrayToUint(address.version, address.array).toString(16).padStart(
      totalBits / 4,
      "0",
    );
  });

  Deno.bench(name + ".toHexString: actual implementataion", () => {
    address.toHexString();
  });
}

benchMethods("IPv4", IPv4Address.fromString("192.168.1.1"));
benchMethods("IPv6", IPv6Address.fromString("2001:db6::1"));
