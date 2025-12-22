import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'installation',
    'quick-start',
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/tracks',
        'features/chapters',
        'features/metadata',
        'features/building',
        'features/projects',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/settings',
        'configuration/ffmpeg',
      ],
    },
    'faq',
  ],
};

export default sidebars;
