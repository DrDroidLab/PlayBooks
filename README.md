

<p align="center">
  <img src="https://drdroid-public-content.s3.us-west-2.amazonaws.com/github-cover-image.png" alt="Doctor Droid Logo" width="50%" height="50%">

</p>
<center>

[Docs](https://docs.drdroid.io) | [Sandbox](https://sandbox.drdroid.io) | [Community](https://join.slack.com/t/doctor-droid-demo/shared_invite/zt-2h6eap61w-Bmz76OEU6IykmDy673R1qQ)

</center>

<br>

tl;dr Enrich your Slack alerts with contextual observability data, helping on-call engineer investigate faster.

## About PlayBooks
PlayBooks are executable notebooks designed to *Automate Preliminary Investigations in Production* for engineers.
Watch [demo video](https://www.youtube.com/watch?v=_e-wOtIm1gk).

Using PlayBooks, a user can configure the steps as data queries or actions within their observability stack. Here are the integrations we currently support: 
1. Run bash commands on a remote server; 
2. Fetch logs from AWS Cloudwatch and Azure Log Analytics; 
3. Fetch metrics from any PromQL compatible db, AWS Cloudwatch, Datadog and New Relic; 
4. Query PostgreSQL, ClickHouse or any other JDBC compatible databases; 
5. Write a custom API call; 
6. Query events from EKS / GKE; 
7. Add an iFrame


### **Automating Playbook Executions**
1. Define a playbook with your enrichment logic
2. Configure the playbook to auto-trigger basis a Slack alert received in a channel
3. Receive automated investigation summary in the Slack thread for the same alert

### Playground:
* The [sandbox](https://sandbox.drdroid.io/) has a sample Playbook created. Check out how it works.
* You can also check out the [#demo-alerts channel](https://join.slack.com/t/doctor-droid-demo/shared_invite/zt-2h6eap61w-Bmz76OEU6IykmDy673R1qQ) in community Slack workspace to see how automated replies are received for alerts.

## Capabilities
- **Enrichment library**: The tool currently supports fetching 50+ types of enrichment data from metric sources (Datadog, New Relic, Grafana+Prometheus, Cloudwatch Metrics), Logs & Events (Cloudwatch Logs, EKS) and Databases (PostgreSQL DB, Clickhouse DB)

- **Past Executions**: See the historical runs of a playbook and go back to an investigation from a specific point in time.

- **Continuous monitoring**: Setup continuous monitoring cron for specific use-cases (e.g. post deployment, peak hours, post bug-fix). Read [docs](https://docs.drdroid.io/docs/setting-up-slack-alert-enrichment-on-self-hosted-playbooks) for list of allowed configurations.

- **Interpretation Layer**: Configure ML modules which can analyse & interpret data from your investigation playbooks.

### Coming Soon:
- **Templates**: Common investigation & troubleshooting logics which can be used out of the box.
- **Conditionals**: Create decision trees in your playbooks basis evaluation of a playbook step.
- **More integrations**: Find something missing? Request [here](https://github.com/DrDroidLab/PlayBooks/issues/new).


## Getting Started with alert enrichment

**Step 1:** Follow this [guide](https://docs.drdroid.io/docs/installation) to setup Playbooks by docker-compose or helm.

**Step 2:** Follow this [Step-by-Step guide](https://docs.drdroid.io/docs/setting-up-slack-alert-enrichment-on-self-hosted-playbooks) to do your first alert enrichment.

## Have feedback or queries?
Asks questions in the [Slack Community](https://join.slack.com/t/doctor-droid-demo/shared_invite/zt-2h6eap61w-Bmz76OEU6IykmDy673R1qQ) or write to us at founders [at] drdroid [dot] io

## Want to contribute?
Read our [contribution guidelines](/CONTRIBUTION.md)

## Roadmap
Read our roadmap [here](/ROADMAP.md)