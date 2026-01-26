import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'DinoConfig Developer Docs',
  tagline: 'Configuration management made simple',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://developer.dinoconfig.com',
  baseUrl: '/',

  organizationName: 'dinoconfig',
  projectName: 'dinoconfig',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/dinoconfig/dinoconfig/tree/main/apps/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/dinoconfig-social-card.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'DinoConfig',
      logo: {
        alt: 'DinoConfig Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/dinoconfig/dinoconfig',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://dinoconfig.com',
          label: 'Dashboard',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Introduction',
              to: '/docs/introduction',
            },
            {
              label: 'JavaScript SDK',
              to: '/docs/javascript-sdk/getting-started',
            },
            {
              label: 'Java SDK',
              to: '/docs/java-sdk/getting-started',
            },
          ],
        },
        {
          title: 'SDKs',
          items: [
            {
              label: 'JavaScript SDK',
              to: '/docs/javascript-sdk/getting-started',
            },
            {
              label: 'Java SDK',
              to: '/docs/java-sdk/getting-started',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/dinoconfig/dinoconfig',
            },
            {
              label: 'Dashboard',
              href: 'https://dinoconfig.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DinoConfig. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['java', 'bash', 'json', 'typescript', 'groovy'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
