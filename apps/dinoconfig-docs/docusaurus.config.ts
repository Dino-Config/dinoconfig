import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DinoConfig Developer Docs',
  tagline: 'Configuration management made simple for JavaScript and Java applications',
  favicon: 'img/favicon.ico',
  future: { v4: true },
  url: 'https://developer.dinoconfig.com',
  baseUrl: '/',
  organizationName: 'dinoconfig',
  projectName: 'dinoconfig',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },

  // SEO: Global head tags
  headTags: [
    // Preconnect to improve performance
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
    // JSON-LD structured data for organization
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'DinoConfig',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        description: 'Modern configuration management platform with SDKs for JavaScript and Java',
        url: 'https://developer.dinoconfig.com',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      }),
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/dinoconfig/dinoconfig/tree/main/apps/docs/',
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
        // SEO: Sitemap generation (included by default in classic preset)
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // SEO: Social card image
    image: 'img/dinoconfig-social-card.png',
    
    // SEO: Global metadata
    metadata: [
      { name: 'keywords', content: 'configuration management, SDK, JavaScript, TypeScript, Java, API, feature flags, remote config' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@dinoconfig' },
      { name: 'og:type', content: 'website' },
      { name: 'og:site_name', content: 'DinoConfig Developer Docs' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
    ],

    colorMode: { defaultMode: 'light', respectPrefersColorScheme: true },
    navbar: {
      title: 'DinoConfig',
      logo: { alt: 'DinoConfig Logo - Configuration Management Platform', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'docsSidebar', position: 'left', label: 'Documentation' },
        { href: 'https://github.com/dinoconfig/dinoconfig', label: 'GitHub', position: 'right' },
        { href: 'https://dinoconfig.com', label: 'Dashboard', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Introduction', to: '/docs/introduction' },
            { label: 'JavaScript SDK', to: '/docs/javascript-sdk/getting-started' },
            { label: 'Java SDK', to: '/docs/java-sdk/getting-started' },
          ],
        },
        {
          title: 'Links',
          items: [
            { label: 'GitHub', href: 'https://github.com/dinoconfig/dinoconfig' },
            { label: 'Dashboard', href: 'https://dinoconfig.com' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DinoConfig.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash', 'json', 'typescript', 'groovy'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
