# Johnny Tech iPhone Store

A multi-page storefront for new and certified pre-owned iPhones, with shop,
trade-in, and inventory management pages.

## Cloudflare D1

The storefront reads and writes settings and inventory through the `DB` D1
binding in `wrangler.jsonc`. Apply the schema before local development or
deployment:

```sh
bunx wrangler d1 migrations apply johnny-tech-db --local
bunx wrangler d1 migrations apply johnny-tech-db --remote
```

Set the admin PIN as a Wrangler secret. It is salted and hashed into D1 on the
first admin sign-in. If the secret changes, the D1 PIN is rotated to the new
secret on the next sign-in; PIN changes made in the admin dashboard remain in
effect until the secret is rotated again. The PIN is never included in public
store data. For local development, create an ignored `.dev.vars` file containing
`ADMIN_PIN=your-4-to-8-digit-pin`. For deployment, use:

```sh
bunx wrangler secret put ADMIN_PIN
```

After the first successful admin sign-in, the PIN can be changed from the
dashboard. Admin sessions use an HttpOnly cookie and are validated against D1.

## Development

Install dependencies with Bun, then start the development server:

```sh
bun install
bun run dev
```

Other useful commands:

```sh
bun run test
bun run lint
bun run build
```
#
