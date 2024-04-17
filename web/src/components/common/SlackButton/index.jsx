import styles from './styles.module.css';

function SlackButton() {
  return (
    <div>
      <a
        href={`/connectors/integrations/handlers/slack_bot/install?user_email=${localStorage.getItem(
          'email'
        )}`}
        className={styles['slack-button']}
      >
        <img src="/slack-logo.svg" alt="Slack Logo" className={styles['slack-svg']} />
        Add to Slack
      </a>
    </div>
  );
}

export default SlackButton;
