# PlayBooks
PlayBooks is an open source alert automation with a web console that lets you easily run automation tasks across your alerts, metrics, logs & databases. It is built and maintained by the team at [Doctor Droid](https://drdroid.io).
<center>

[Docs](https://docs.drdroid.io) | [Installation](https://docs.drdroid.io/docs/installation) | [Quick Start Guide](https://docs.drdroid.io/docs/quick-start-guide) | [Changelog](https://docs.drdroid.io/changelog)

</center>

## Capabilities:
- Fetch observability data from Datadog, Cloudwatch, New Relic, Grafana, PostgreSQL and more. Full list [here](https://docs.drdroid.io/docs/integrations).
- Setup triggers: Run a playbook from a Slack message or PagerDuty / OpsGenie alert.
- Playbooks: Create sequence of multiple metrics / logs to be fetched in one-go from different tools.
- Auto-investigation: Receive response after a playbook run in your Slack channel or your alerting tool with the investigation data published.
- [ ] Saving past executions.
- [ ] Enable conditional trees to be created within playbooks
- [ ] Enable triggering 3rd party API call to fetch.
- [ ] Support 50 out-of-the-box templates. Add your wishlist here.
- [ ] Enable actions.

## Deployments:
Refer to Docker based setup instructions [here](/setup/Docker.md).
- [ ] Run on Kubernetes (via Helm)

## License
Playbooks is licensed under the [MIT License](https://github.com/DrDroidLab/PlayBooks/blob/main/LICENSE).