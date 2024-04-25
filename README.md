

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
{Demo Video}
### **Automating Playbook Executions**
1. Define a playbook with your enrichment logic
2. Configure the playbook to auto-trigger basis a Slack alert received in a channel
3. Receive automated investigation summary in the Slack thread for the same alert

### Playground:
* Explore the [sandbox](https://sandbox.drdroid.io/) to get a sense of how the playbooks work.
* You can also check out the [#demo-alerts channel](https://join.slack.com/t/doctor-droid-demo/shared_invite/zt-2h6eap61w-Bmz76OEU6IykmDy673R1qQ) in community Slack workspace to see how automated replies are received for alerts.

## Capabilities
- **Enrichment library**: The tool currently supports fetching 50+ types of enrichment data from metric sources (Datadog, New Relic, Grafana+Prometheus, Cloudwatch Metrics), Logs & Events (Cloudwatch Logs, EKS) and Databases (PostgreSQL DB, Clickhouse DB)

- **Past Executions**: See the historical runs of a playbook and go back to an investigation from a specific point in time.

- **Continuous monitoring**: Setup continuous monitoring cron for specific use-cases (e.g. post deployment, peak hours, post bug-fix). Read [docs](https://docs.drdroid.io/docs/setting-up-slack-alert-enrichment-on-self-hosted-playbooks) for list of allowed configurations.


### Coming Soon:
- **Interpretation Layer**: Configure ML modules which can analyse & interpret data from your investigation playbooks.
- **Templates**: Common investigation & troubleshooting logics which can be used out of the box.
- **Conditionals**: Create decision trees in your playbooks basis evaluation of a playbook step.
- **More integrations**: Find something missing? Request [here](https://github.com/DrDroidLab/PlayBooks/issues/new).



## Getting Started with alert enrichment
#### Self-hosting:
**Step 1:** We currently support setup using docker.
Run the below command and signup on [localhost](http://localhost:80) to start creating playbooks.

```
git clone git@github.com:DrDroidLab/PlayBooks.git
```
```
docker-compose -f playbooks.docker-compose.yaml up -d
```
**Step 2:** Follow this [Step-by-Step guide](https://docs.drdroid.io/docs/setting-up-slack-alert-enrichment-on-self-hosted-playbooks) to do your first alert enrichment.

#### [Cloud Signup](https://playbooks.drdroid.io/signup)

## Have feedback or queries?
Asks questions in the [Slack Community](https://join.slack.com/t/doctor-droid-demo/shared_invite/zt-2h6eap61w-Bmz76OEU6IykmDy673R1qQ) or write to us at founders [at] drdroid [dot] io