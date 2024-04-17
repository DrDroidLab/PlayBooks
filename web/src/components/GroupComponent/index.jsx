import React from 'react';
import SelectComponent from '../SelectComponent';
import styles from './index.module.css';
import { randomString } from '../../utils/utils';

const GroupComponent = ({
  options,
  groupItems,
  onGroupItemAdd,
  onGroupItemUpdate,
  onGroupItemDelete
}) => {
  const handleAddGroupClick = () => {
    onGroupItemAdd([...groupItems, { itemId: randomString() }]);
  };

  const handleGroupByChange = (itemId, id, option) => {
    const updatedGroups = groupItems.map(group => {
      if (group.itemId === itemId) {
        return { ...group, itemLabel: id, ...option };
      }
      return group;
    });
    onGroupItemUpdate(updatedGroups);
  };
  const handleGroupByDelete = id => () => {
    const updatedGroups = groupItems.filter(group => group.itemId !== id);
    onGroupItemDelete(updatedGroups);
  };
  return (
    <div className={styles['container']}>
      {groupItems.map(group => {
        const { itemId, itemLabel } = group;
        return (
          <div key={itemId} className={styles['container__item']}>
            <SelectComponent
              searchable
              data={options}
              placeholder="Select Group by"
              onSelectionChange={(id, option) => handleGroupByChange(itemId, id, option)}
              selected={itemLabel}
            />
            <button className="text-xs text-gray-500 ml-2" onClick={handleGroupByDelete(itemId)}>
              Delete
            </button>
          </div>
        );
      })}
      <button onClick={handleAddGroupClick} className="text-xs text-gray-500">
        + Add
      </button>
    </div>
  );
};

export default GroupComponent;
