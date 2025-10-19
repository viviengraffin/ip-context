# ip-context [![JSR](https://jsr.io/badges/@viviengraffin/ip-context)](https://jsr.io/@viviengraffin/ip-context) [![JSR Score](https://jsr.io/badges/@viviengraffin/ip-context/score)](https://jsr.io/@viviengraffin/ip-context/score) [![NPM](https://img.shields.io/npm/v/%40viviengraffin%2Fip-context)](https://www.npmjs.com/package/@viviengraffin/ip-context)

This is the french version of the presentation of this library, if you don't
speak french, go [here](../../README.md)

ip-context est une librairie Deno.js pour faire des calculs à partir d'adresses
IPv4/IPv6 ou de contexte réseau.

## Comment contribuer ?

Si vous souhaitez contribuer à ce projet, allez [ici](COMMENT_CONTRIBUER.md)

## Examples de base

### Récupérer la taille d'un réseau

Pour récupérer la taille d'un réseau, vous devez créer un contexte qui
contiendra une adresse ainsi qu'un masque de sous-réseau. Voici plusieurs
manières de le faire :

#### Avec la fonction context

En savoir plus sur la fonction context [ici](https://jsr.io/@viviengraffin/ip-context/doc/~/context)

```ts
import { context } from "@viviengraffin/ip-context";

const ctx = context("192.168.1.1/24"); // Notation avec CIDR
console.log(ctx.size); // Calcule et récupère la taille du réseau
console.log(ctx.hosts); // Calcule et récupère le nombre d'adresses IP adressables dans ce réseau
```

#### Avec la classe IPv4Context et la méthode statique fromStringWithCidr

En savoir plus sur la classe IPv4Context [ici](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv4Context)

```ts
import { IPv4Context } from "@viviengraffin/ip-context";

const ctx = IPv4Context.fromStringWithCidr("192.168.1.1/24"); // Utilise la classe IPv4Context pour déterminer directement le type
console.log(ctx.size);
console.log(ctx.hosts);
```

#### Avec les classes IPv4Context, IPv4Address, IPv4Submask

En savoir plus sur [IPv4Context](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv4Context), [IPv4Address](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv4Address) et [IPv4Submask](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv4Submask)

```ts
import {
  IPv4Address,
  IPv4Context,
  IPv4Submask,
} from "@viviengraffin/ip-context";

const ctx = new IPv4Context(
  IPv4Address.fromString("192.168.1.1"),
  IPv4Submask.fromCidr(24),
); // Utilise les classes pour construire le contexte réseau
console.log(ctx.size);
console.log(ctx.hosts);
```

#### Avec les classes IPv6Context, IPv6Address, IPv6Submask

En savoir plus sur [IPv6Context](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv6Context), [IPv6Address](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv6Address) et [IPv6Submask](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv6Submask)

```ts
import {
  IPv6Address,
  IPv6Context,
  IPv6Submask,
} from "@viviengraffin/ip-context";

const ctx = new IPv6Context(
  IPv6Address.fromString("2001:db6::1"),
  IPv6Submask.fromCidr(64),
);
console.log(ctx.size);
console.log(ctx.hosts);
```

#### Pour IPv4, si aucun CIDR ou masque de sous réseau n'est passé à la fonction context, il se base sur la classe IPv4

En savoir plus sur la fonction context [ici](https://jsr.io/@viviengraffin/ip-context/doc/~/context)

```ts
import { context, IPv4Address } from "@viviengraffin/ip-context";

const ctx = context("192.168.1.1") as IPv4Address; // Caster le résultat de context pour que TypeScript comprenne que l'on attend une instance de IPv4Context
console.log(ctx.class); // Classe de l'adresse IPv4 (ici C)
console.log(ctx.size);
console.log(ctx.hosts);
```

### Récupérer les adresses réseau, broadcast, première adresse adressable, dernière adresse adressable

```ts
// IPv4
import { context } from "@viviengraffin/ip-context";

const ctx = context("192.168.1.1/24");
console.log(ctx.network.toString()); // Affiche l'adresse réseau
console.log(ctx.broadcast.toString()); // Affiche l'adresse broadcast
console.log(ctx.firstHost.toString()); // Affiche la première adresse adressable
console.log(ctx.lastHost.toString()); // Affiche la dernière adresse adressable

// IPv6
import { context } from "@viviengraffin/ip-context";

const ctx = context("2001:db6::1/64");
console.log(ctx.network.toString()); // Affiche l'adresse réseau
console.log(ctx.firstHost.toString()); // Affiche la première adresse adressable
console.log(ctx.lastHost.toString()); // Affiche la dernière adresse adressable
```

### Vérification de la présence d'une adresse dans un contexte réseau

Il existe deux méthodes pour vérifier la présence d'une adresse IP dans un
contexte réseau :

- includes : Vérifie si cette adresse IP est présent dans ce réseau
- isHost : Vérifie si cette adresse IP est adressable dans ce réseau

```ts
// IPv4 (fonctionne de la même manière en IPv6)
import { context } from "@viviengraffin/ip-context";

const ctx = context("192.168.1.1/24");
ctx.includes("192.168.1.0"); // Vrai, même si 192.168.1.0 est l'adresse réseau, elle est présente dans ce réseau
ctx.isHost("192.168.1.0"); // Faux, même si cette adresse est présente dans ce réseau, c'est l'adresse réseau qui n'est pas adressable
```

### Créer un contexte réseau pour un nombre d'hôte

Il y a trois méthodes pour cela :

#### Créer un IPAddress ([IPv4Address](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv4Address) ou [IPv6Address](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv6Address)) et utiliser la méthode createContextWithHosts

```ts
import { IPv4Address } from "@viviengraffin/ip-context";

const ip=IPv4Address.fromString("192.168.1.1");
const ctx=ip.createContextWithHosts(512);
console.log(ctx.hosts); // 1022
```

#### Utiliser les classes Context, IPAddress et Submask

- classes Context : [IPv4Context](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv4Context) ou [IPv6Context](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv6Context)
- classes IPAddress : [IPv4Address](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv4Address) ou [IPv6Address](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv6Address)
- classes Submask : [IPv4Submask](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv4Submask) ou [IPv6Submask](https://jsr.io/@viviengraffin/ip-context/doc/~/IPv6Submask)

Avec les classes pour IPv4

```ts
import { IPv4Context, IPv4Address, IPv4Submask } from "@viviengraffin/ip-context";

const ctx=new IPv4Context(
  IPv4Address.fromString("192.168.1.1"),
  IPv4Submask.fromHosts(512)
);
console.log(ctx.hosts); // 1022
```

#### Avec la fonction contextWithHosts

En savoir plus sur la fonction contextWithHosts [ici](https://jsr.io/@viviengraffin/ip-context/doc/~/contextWithHosts)

```ts
import { contextWithHosts } from "@viviengraffin/ip-context";

const ctx=contextWithHosts("192.168.1.1",512);
console.log(ctx.hosts); // 1022
```