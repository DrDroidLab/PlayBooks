import styles from './styles.module.css';
import { useSelector } from 'react-redux';
import ValueComponent from '../../ValueComponent/index.jsx';
import { playgroundSelector } from '../../../store/features/playground/playgroundSlice.ts';

function PlaygroundVariables() {
  const playbook = useSelector(playgroundSelector);

  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 p-1" style={{ paddingLeft: 0 }}>
        Variables{' '}
        {playbook?.globalVariables?.length > 0 &&
          `(${playbook?.globalVariables?.length} variable${
            playbook?.globalVariables?.length > 1 ? 's' : ''
          })`}
      </div>
      <hr />
      <div className={styles.info}>
        {playbook?.globalVariables?.length > 0 ? (
          playbook?.globalVariables.map((variable, index) => (
            <div key={index} className={styles.variable}>
              <div className={styles.name}>{variable.name}</div>
              <ValueComponent
                valueType={'STRING'}
                value={variable.value}
                placeHolder={'Enter variable value'}
                length={200}
                disabled={true}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-400">
            Variables defined in the playbook will be visible here. Read more about variables{' '}
            <a
              href="https://docs.drdroid.io/docs/global-variables"
              target="_blank"
              rel="noreferrer"
              className="text-violet-600"
            >
              here
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}

export default PlaygroundVariables;
