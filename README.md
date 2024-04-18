<p align="center">
  <img src="https://drdroid-public-content.s3.us-west-2.amazonaws.com/Horizontal+Logo.png" alt="Doctor Droid Logo" width="50%" height="50%">

</p>

<center>

[Docs](https://docs.drdroid.io) | [Sandbox](https://sandbox.drdroid.io) | [Installation](https://docs.drdroid.io/docs/installation) | [Quick Start Guide](https://docs.drdroid.io/docs/quick-start-guide) | [Changelog](https://docs.drdroid.io/changelog)

</center>

## Accelerate triaging and automate diagnosis with Playbooks
<div style="display: flex; justify-content: space-between;">
<img src="https://assets-global.website-files.com/642ad9ebc00f9544d49b1a6b/65e82550d0b81966987ea751_status-quo-p-500.png" alt="Doctor Droid before" style="width: 45%; margin-right: 2%;margin-left: 3%; height: 40%;">
<img src="https://assets-global.website-files.com/642ad9ebc00f9544d49b1a6b/65e825a048a51382adfbe967_with-doctor-droid-tree-p-500.png" alt="Doctor Droid after" style="width: 45%; margin-right: 3%; margin-left: 2%; height: 40%;">
</div>


## Using Doctor Droid playbooks, you can create & run automated investigations, spanning across your observability data.
- Fetch observability data from Datadog, Cloudwatch, New Relic, Grafana, PostgreSQL and more. Full list [here](https://docs.drdroid.io/docs/integrations).
- Setup triggers: Trigger a playbook from an alert in Slack.
    - [ ] Add support for PagerDuty / OpsGenie / Datadog.
- Sequence: Create sequence of multiple metrics / logs to be fetched in one-go from different tools.
- Auto-investigation: Receive response after a playbook run in your Slack channel or your alerting tool with the investigation data published.
- [ ] Saving past executions.
- [ ] Enable conditional trees to be created within playbooks
- [ ] Add support for custom API call from playbook.
- [ ] Add templates.

Explore [sandbox](https://sandbox.drdroid.io/).



## Getting Started with Installation:
Refer to Docker based setup instructions [here](/setup/Docker.md).
- [ ] Run on Kubernetes (via Helm)


## License
Playbooks is licensed under the [MIT License](https://github.com/DrDroidLab/PlayBooks/blob/main/LICENSE).
