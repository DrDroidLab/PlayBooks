import React from 'react';
import styles from './index.module.css';

const TabPanel = props => {

    const {value ,currentTab, setCurrentTab } = props;

    const handleTabClick = () => {
        setCurrentTab(value);
    }

    return (
        <div className={styles['container']}>
            <div className={styles['tabs']}>
                <button key={value} disabled={currentTab === value} onClick={handleTabClick}>{value}</button>
            </div>
        </div>
    );
}

export default TabPanel;
