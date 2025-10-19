export const environment = {
    apiUrl: process.env.NX_PUBLIC_BUILDER_DINOCONFIG_API_URL,
    homeUrl: process.env.NX_PUBLIC_BUILDER_DINOCONFIG_HOME_URL || '',
    stripePublishableKey: process.env.NX_PUBLIC_BUILDER_STRIPE_PUBLISHABLE_KEY,
    stripeFreePriceId: process.env.NX_PUBLIC_BUILDER_STRIPE_FREE_PRICE_ID,
    stripeStarterPriceId: process.env.NX_PUBLIC_BUILDER_STRIPE_STARTER_PRICE_ID,
    stripeProPriceId: process.env.NX_PUBLIC_BUILDER_STRIPE_PRO_PRICE_ID,
    stripeCustomPriceId: process.env.NX_PUBLIC_BUILDER_STRIPE_CUSTOM_PRICE_ID
};
