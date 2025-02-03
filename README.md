<p align="center">
  <img src="https://drdroid-public-content.s3.us-west-2.amazonaws.com/github-cover-image.png" alt="Doctor Droid Logo" width="30%" height="50%">

</p>



tl;dr Automate investigation of production issues with Doctor Droid Bot.

## Watch [Demo](https://www.youtube.com/watch?v=Uu3k-qQ3Pvw) of our v1.3.3 release
<p align="center">
  <a href="https://www.youtube.com/watch?v=Uu3k-qQ3Pvw">
    <img src="https://drdroid-public-content.s3.us-west-2.amazonaws.com/automate-investigations-thumbnail-github.png" alt="Doctor Droid Demo" width="60%" height="50%">
  </a>
</p>

<br>

## How does Doctor Droid automate investigations?

Doctor Droid is a bot that can automatically go to 15+ types of observability tools & servers, run commands and fetch data for you whenever you receive an alert.

This helps reduce the time taken to investigate an issue and can potentially completely automate it.


<p align="center">
  <img src="https://drdroid-public-content.s3.us-west-2.amazonaws.com/doctor-droid-automation.png" alt="How Doctor Droid works" width="75%" height="50%">
</p>

<br>

## How to configure Investigations in Doctor Droid?

You can **create PlayBooks** to configure investigations. **PlayBooks are intelligent documents that are connected to every part of your stack** where you might need to look for monitoring -- you can fetch logs, metrics, query databases, run commands on remote servers, fetch container data and even define custom API calls.

<p align="center">
  <img src="https://drdroid-public-content.s3.us-west-2.amazonaws.com/sample-investigation-playbook.png" alt="A Sample Playbook in Doctor Droid" width="75%" height="50%">
</p>


### Playground:
* The [sandbox](https://sandbox.drdroid.io/) has a few sample playbooks created.
* You can also check out the [#demo-alerts channel](https://join.slack.com/t/doctor-droid-demo/shared_invite/zt-2h6eap61w-Bmz76OEU6IykmDy673R1qQ) in community Slack workspace to see how automated replies are received for alerts.

## Getting Started

#### 1. [Documentation](https://docs.drdroid.io)

#### 2. Installation

Use this command to get started using Docker:
```
docker-compose -f deploy.docker-compose.yaml up -d
```
#### 3. Security
The project uses default tokens to encrypt connector keys. Follow the following steps to generate a new token for your deployment:
```
from cryptography.fernet import Fernet

# Generate a new Fernet key
key = Fernet.generate_key()
print(key.decode())  # Print it as a string to use in settings
```
Export this as an ENV variable 'FIELD_ENCRYPTION_KEY' in your deployment.
 

Looking for Helm chart or custom branch deployment? Read our installation doc [here](https://docs.drdroid.io/docs/installation).

#### 4. Learn more: Watch tutorials on our [YouTube](https://www.youtube.com/@DrDroidDev) channel

## Connect with us:
* Want to contribute? Read our [contribution guidelines](https://docs.drdroid.io/docs/contributing).

* For Feedback or Feature Requests: Share with us in Slack or Github issues.

* Bug Report? Create a [jam](https://jam.dev/) and share it with us on Github or Slack!

<center>

[Slack Community](https://join.slack.com/t/doctor-droid-demo/shared_invite/zt-2h6eap61w-Bmz76OEU6IykmDy673R1qQ)
| [Roadmap](/ROADMAP.md) | [Docs](https://docs.drdroid.io)
</center>
