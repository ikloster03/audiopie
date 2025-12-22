import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

type FeatureItem = {
  titleId: string;
  titleDefault: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  descriptionId: string;
  descriptionDefault: string;
};

const FeatureList: FeatureItem[] = [
  {
    titleId: 'feature.mp3toM4b.title',
    titleDefault: 'MP3 to M4B Conversion',
    Svg: require('@site/static/img/undraw_audio.svg').default,
    descriptionId: 'feature.mp3toM4b.description',
    descriptionDefault: 'Convert your collection of MP3 files into a single M4B audiobook with proper chapter markers and metadata.',
  },
  {
    titleId: 'feature.chapters.title',
    titleDefault: 'Chapter Editing',
    Svg: require('@site/static/img/undraw_chapters.svg').default,
    descriptionId: 'feature.chapters.description',
    descriptionDefault: 'Automatically generate chapters from your tracks. Rename, reorder, and organize chapters with drag and drop.',
  },
  {
    titleId: 'feature.metadata.title',
    titleDefault: 'Rich Metadata',
    Svg: require('@site/static/img/undraw_metadata.svg').default,
    descriptionId: 'feature.metadata.description',
    descriptionDefault: 'Add title, author, genre, description, and cover art. Everything is embedded in the final audiobook.',
  },
];

function Feature({titleId, titleDefault, Svg, descriptionId, descriptionDefault}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">
          <Translate id={titleId}>{titleDefault}</Translate>
        </Heading>
        <p>
          <Translate id={descriptionId}>{descriptionDefault}</Translate>
        </p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
