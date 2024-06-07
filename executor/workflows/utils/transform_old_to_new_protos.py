def transform_old_entry_points_definition_to_new(entry_point):
    ep_type = entry_point.get('type')
    if ep_type == "API":
        return entry_point
    elif ep_type == "ALERT":
        return {"type": "SLACK_CHANNEL_ALERT", "slack_channel_alert": {
            "slack_alert_type": entry_point['alert_config']['slack_channel_alert_config']['slack_alert_type'],
            "slack_channel_id": entry_point['alert_config']['slack_channel_alert_config']['slack_channel_id'],
            "slack_channel_name": entry_point['alert_config']['slack_channel_alert_config']['slack_channel_name'],
            "slack_alert_filter_string": entry_point['alert_config']['slack_channel_alert_config'][
                'slack_alert_filter_string']}}
    else:
        raise ValueError(f"Entry point type {ep_type} is not supported")


def transform_old_action_definition_to_new(action):
    action_type = action.get('type')
    if action_type == 'NOTIFY':
        notification_config = action.get('notification_config')
        notification_type = notification_config.get('type')
        if notification_type == 'SLACK':
            slack_config = notification_config.get('slack_config')
            message_type = slack_config.get('message_type')
            if message_type == 'THREAD_REPLY':
                return {"type": "SLACK_THREAD_REPLY",
                        "slack_thread_reply": {"slack_channel_id": slack_config['slack_channel_id']}}
            elif message_type == 'MESSAGE':
                return {"type": "SLACK_MESSAGE",
                        "slack_message": {"slack_channel_id": slack_config['slack_channel_id']}}
            else:
                raise ValueError(f"Message type {message_type} is not supported")
        else:
            raise ValueError(f"Notification type {notification_type} is not supported")
    else:
        raise ValueError(f"Action type {action_type} is not supported")


def transform_old_schedule_definition_to_new(schedule):
    schedule_type = schedule.get('type')
    if schedule_type == 'ONE_OFF':
        return schedule
    elif schedule_type == 'PERIODIC':
        periodic_config = schedule.get('periodic')
        periodic_type = periodic_config.get('type')
        duration_in_seconds = periodic_config.get('duration_in_seconds')
        if periodic_type == 'INTERVAL':
            task_interval = periodic_config.get('task_interval')
            interval_in_seconds = task_interval.get('interval_in_seconds')
            return {"type": "INTERVAL", "interval": {"interval_in_seconds": interval_in_seconds,
                                                     "duration_in_seconds": duration_in_seconds}}
        elif periodic_type == 'CRON':
            cron_config = periodic_config.get('cron_rule')
            return {"type": "CRON", "cron": {"rule": cron_config['rule'], "timezone": cron_config.get('timezone', ''),
                                             "duration_in_seconds": duration_in_seconds}}
        else:
            raise ValueError(f"Periodic type {periodic_type} is not supported")
    else:
        raise ValueError(f"Schedule type {schedule_type} is not supported")
