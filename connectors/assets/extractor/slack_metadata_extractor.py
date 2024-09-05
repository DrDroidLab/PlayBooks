import logging

logger = logging.getLogger(__name__)


def safe_eval(dict_string_or_dict):
    # Check if the input is already a dictionary
    if isinstance(dict_string_or_dict, dict):
        return dict_string_or_dict
    try:
        # Safely evaluate the string representation of a dictionary
        return eval(dict_string_or_dict)
    except Exception as e:
        logger.error(f"Error occurred while evaluating the string: {dict_string_or_dict} with error: {e}")
        # Return an empty dictionary in case of an error
        return {}


def text_identifier_v2(full_message, channel_type):
    if channel_type == 'slack':
        key_names = {'text', 'plain_text', 'fallback', 'preview_plain_text'}
    elif channel_type == 'g_chat':
        key_names = {'text', 'title', 'subtitle'}
    full_text = []
    data = safe_eval(full_message)

    def traverse(obj):
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key in key_names and isinstance(value, str):
                    full_text.append(value)
                elif isinstance(value, (dict, list)):
                    traverse(value)
        elif isinstance(obj, list):
            for item in obj:
                traverse(item)

    traverse(data)
    full_text = [x for x in full_text if x != "This content can't be displayed."]
    return ' \n'.join(full_text)


def title_identifier(full_message, channel_type):
    message = safe_eval(full_message)
    title = ''
    if channel_type == 'slack':
        titles = []
        if 'title' in message:
            titles.append(message.get('title'))
        elif 'text' in message:
            titles.append(message.get('text'))
        attachments = message.get('attachments')
        if attachments:
            for attachment in attachments:
                if 'title' in attachment:
                    titles.append(attachment.get('title'))
            # remove all strings that are "The content in this can't be displayed."
        titles = [x for x in titles if x != "This content can't be displayed."]
        if titles:
            title = max(titles, key=len)
            if title == '':
                title = title_deeper_search(full_message, ['title', 'text', 'fallback'])
        else:
            title = title_deeper_search(full_message, ['title'])
        return title
    elif channel_type == 'g_chat':
        message = safe_eval(full_message)
        titles = []
        cards_list = []
        if 'cards' in message:
            cards_list = message.get('cards')
        elif 'cardsV2' in message:
            cards_list = message.get('cardsV2')
        if cards_list and len(cards_list) > 0:
            for card in cards_list:
                if 'header' in card:
                    header = card.get('header')
                    if 'title' in header:
                        title = header.get('title')
                        titles.append(title)
            if titles:
                title = max(titles, key=len)
                return title
        if 'text' in message:
            title = message.get('text')
        elif 'formattedText' in message:
            title = message.get('formattedText')
        elif 'argumentText' in message:
            title = message.get('argumentText')
        if title == '':
            title = "Custom Alert"
        return title


def title_deeper_search(full_message, key_names=None):
    if key_names is None:
        key_names = ['title']
    titles_list = []
    data = safe_eval(full_message)

    def traverse(obj):
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key in key_names and isinstance(value, str):
                    titles_list.append(value)
                elif key == 'files':
                    continue
                elif isinstance(value, (dict, list)):
                    traverse(value)
        elif isinstance(obj, list):
            for item in obj:
                traverse(item)

    traverse(data)
    if titles_list:
        title = max(titles_list, key=len)
    else:
        title = 'Custom Alert'
    return title


def source_identifier(full_message_cell, channel_type):
    try:
        message = safe_eval(full_message_cell)
    except Exception as e:
        logger.error(f"Exception occurred while parsing full_message: {full_message_cell} with error: {e}")
        return 'custom_bot'

    bot_name_mapping = {'Sentry': 'Sentry', 'Robusta': 'Robusta', 'AWS Chatbot': 'Cloudwatch', 'MetaBot': 'Metabase',
                        'BluejayApp': 'Cloudwatch', 'RDS_lag_alert': 'Cloudwatch',
                        'Postgres Replica Lag Alert': 'Cloudwatch', 'Alertmanager': 'Prometheus_AlertManager',
                        'Grafana': 'Grafana', 'Coralogix': 'Coralogix', 'Datadog': 'Datadog', 'PagerDuty': 'PagerDuty',
                        'Prometheus': 'Prometheus_AlertManager', 'Opsgenie for Alert Management': 'OpsGenie'}
    sentry_keywords = ['Sentry']
    newrelic_keywords = ['Newrelic', 'New relic']
    honeybadger_keywords = ['Honeybadger']
    coralogix_keywords = ['coralogix']
    datadog_keywords = ['Datadog']
    dr_droid_keywords = ['drdroid', 'doctordroid', 'doctor droid', 'dr droid', 'dr. droid', 'dr.droid']
    cloudwatch_keywords = ['Cloudwatch', 'Cloud watch', 'AWS Cloudwatch', 'marbot', 'AWS Chatbot', 'Amazon CloudWatch']
    gcp_keywords = ['Google Cloud Monitoring', 'console.cloud.google', 'cloud.google.com/monitoring']
    alert_manager_keywords = ['9093', 'alertmanager']
    robusta_keywords = ['Robusta']
    infra_keywords_extension = ['awsMQ', 'Redshift', 'amazonMQ', 'CacheClusterId', 'DBInstanceIdentifier', 'QueueName',
                                'DBClusterIdentifier', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1',
                                'eu-west-2', 'eu-central-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
                                'ap-northeast-2', 'ap-south-1', 'sa-east-1', 'ca-central-1', 'af-south-1', 'eu-south-1',
                                'me-south-1']
    unrelated_bots_keywords = ['giphy', 'polly']
    grafana_keywords = ['grafana']
    source = "custom_bot"
    if channel_type == 'slack':
        attachments = message.get('attachments')
        files = message.get('files')
        if 'client_msg_id' in message:
            source = "Not an alert"
        elif 'bot_profile' in message:
            source = message['bot_profile'].get('name', "custom_bot")
            for bot_name, bot_name_mapping in bot_name_mapping.items():
                if bot_name.lower() in source.lower():
                    source = bot_name_mapping
                    return source
            if any(key_word.lower() in str(source).lower() for key_word in unrelated_bots_keywords):
                source = 'Not an alert'
        elif 'subtype' in message:
            if message.get('subtype') != 'bot_message':
                source = "Not an alert"
            elif 'username' in message:
                source = message.get('username', "custom_bot")
                for bot_name, bot_name_mapping in bot_name_mapping.items():
                    if bot_name.lower() in source.lower():
                        source = bot_name_mapping
                        return source
        elif attachments:
            for attachment in attachments:
                if 'author_subname' in attachment:
                    source = "Not an alert"
                    break
        elif 'bot_id' in message:
            source = "custom_bot"
        elif files:
            for file in files:
                if 'display_as_bot' in file:
                    dis = file.get('display_as_bot')
                    if not dis:
                        source = "Not an alert"
        else:
            source = 'custom_bot'
    elif channel_type == 'g_chat':
        message_type = message.get('message_type')
        if message_type != 'BOT':
            source = "Not an alert"
    if source != 'Not an alert':
        if any(key_word.lower() in str(message).lower() for key_word in coralogix_keywords):
            source = 'Coralogix'
        elif any(key_word.lower() in str(message).lower() for key_word in cloudwatch_keywords):
            source = 'Cloudwatch'
        elif any(key_word.lower() in str(message).lower() for key_word in gcp_keywords):
            source = 'Google Cloud Monitoring'
        elif any(key_word.lower() in str(message).lower() for key_word in honeybadger_keywords):
            source = 'Honeybadger'
        elif any(key_word.lower() in str(message).lower() for key_word in newrelic_keywords):
            source = 'New Relic'
        elif any(key_word.lower() in str(message).lower() for key_word in datadog_keywords):
            source = 'Datadog'
        elif any(key_word.lower() in str(message).lower() for key_word in sentry_keywords):
            source = 'Sentry'
        elif any(key_word.lower() in str(message).lower() for key_word in grafana_keywords):
            source = 'Grafana'
        elif any(key_word.lower() in str(message).lower() for key_word in robusta_keywords):
            source = 'Robusta'
        elif any(key_word.lower() in str(message).lower() for key_word in alert_manager_keywords):
            source = 'Prometheus_AlertManager'
        elif any(key_word.lower() in str(message).lower() for key_word in dr_droid_keywords):
            source = 'Doctor Droid'
        elif any(key_word.lower() in str(message).lower() for key_word in infra_keywords_extension):
            source = 'Cloudwatch'
    return source
