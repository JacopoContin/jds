export const site = {
  name: "JDS",
  fullName: "Jaco Design System",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.usejds.dev",
  github: "https://github.com/JacopoContin/jds",
  namespace: "@jds",
  proNamespace: "@jds-pro",
  pro: {
    /** One-time price shown on /pro. Keep in sync with the Polar product. */
    price: "€50",
    /** Polar checkout link. Server-only: /pro renders on the server. Unset, the button reads "Coming soon". */
    checkoutUrl: process.env.JDS_PRO_CHECKOUT_URL,
  },
}
