# Setup using Docker
```
cd docker
docker-compose -f playbooks.docker-compose.yaml up -d
```

Go to [http://localhost](http://localhost:80) to access the portal. 

## Get started
Signup at [http://localhost/signup](http://localhost:80/signup) to create your user and create playbooks. 


>**Disclaimer**: we use [PostHog](https://posthog.com/faq) to collect anonymous telemetries to better learn how users use Playbooks (masked screen recordings for portal usage)
To turn PostHog off, set the `POSTHOG_ENABLED=false` environment variable in the `playbooks.docker-compose.yaml` file