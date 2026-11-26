import { describe, expect, test } from "vitest";
import { IPv4Submask, IPv6Submask } from "../../src/main.ts";

describe("IPv4 Wildcard", ()=>{
    test("0.0.0.255", ()=>{
        expect(IPv4Submask.fromWildcard("0.0.0.255").toString()).toBe("255.255.255.0");
    });

    test("0.0.255.255", ()=>{
        expect(IPv4Submask.fromWildcard("0.0.255.255").toString()).toBe("255.255.0.0");
    });

    test("0.255.0.255", ()=>{
        expect(()=>IPv4Submask.fromWildcard("0.255.0.255")).toThrow();
    });

    test("0.127.255.255", ()=>{
        expect(IPv4Submask.fromWildcard("0.127.255.255").toString()).toBe("255.128.0.0");
    });

    test("0.255.127.255", ()=>{
        expect(()=>IPv4Submask.fromWildcard("0.255.127.255")).toThrow();
    });

    test("0.0.90.255", ()=>{
        expect(()=>IPv4Submask.fromWildcard("0.0.90.255")).toThrow();
    });
});

describe("IPv6 Wildcard", ()=>{
    test("::ffff:ffff:ffff:ffff", ()=>{
        expect(IPv6Submask.fromWildcard("::ffff:ffff:ffff:ffff").cidr).toBe(64);
    });

    test("::ffff:ffff", ()=>{
        expect(IPv6Submask.fromWildcard("::ffff:ffff").cidr).toBe(96);
    });

    test("::1:fffe", ()=>{
        expect(IPv6Submask.fromWildcard("::1:ffff").cidr).toBe(111);
    });

    test("ffff::ffff", ()=>{
        expect(()=>IPv6Submask.fromWildcard("ffff::ffff")).toThrow();
    });

    test("::fffe:ffff", ()=>{
        expect(()=>IPv6Submask.fromWildcard("::fffe:ffff")).toThrow();
    });
});