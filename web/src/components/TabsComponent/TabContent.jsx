import React from 'react';
import styles from './index.module.css';
import IntegrationCard from '../common/IntegrationCard';

const TabContent = props => {
  const { id, title, cards } = props;

  return (
    <div className={styles['content']} key={id}>
      <div className={styles['segmentTitle']}>
        <h1>{title}</h1>
        <hr></hr>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="flex flex-wrap">
          {cards?.map(card => (
            <IntegrationCard key={card.id} data={card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabContent;
