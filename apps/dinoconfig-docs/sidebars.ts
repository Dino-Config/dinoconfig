import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'doc',
      id: 'introduction',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'JavaScript SDK',
      collapsed: false,
      link: {
        type: 'generated-index',
        title: 'JavaScript SDK',
        description: 'Complete documentation for the DinoConfig JavaScript SDK.',
        slug: '/javascript-sdk',
      },
      items: [
        'javascript-sdk/getting-started',
        'javascript-sdk/configuration',
        'javascript-sdk/configs-api',
        'javascript-sdk/discovery-api',
        'javascript-sdk/cache-api',
        'javascript-sdk/typescript',
        'javascript-sdk/examples',
      ],
    },
    {
      type: 'category',
      label: 'Java SDK',
      collapsed: false,
      link: {
        type: 'generated-index',
        title: 'Java SDK',
        description: 'Complete documentation for the DinoConfig Java SDK.',
        slug: '/java-sdk',
      },
      items: [
        'java-sdk/getting-started',
        'java-sdk/configuration',
        'java-sdk/configs-api',
        'java-sdk/discovery-api',
        'java-sdk/typed-configs',
        'java-sdk/examples',
      ],
    },
  ],
};

export default sidebars;
