git pull
git checkout $1

cd ../web


sudo docker build -t drdroid/playbooks-web:$1 .

aws ecr-public get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin public.ecr.aws/y9s1f3r5

sudo docker tag drdroid/playbooks-web:$1 public.ecr.aws/y9s1f3r5/drdroid/playbooks-web:$1
sudo docker push public.ecr.aws/y9s1f3r5/drdroid/playbooks-web:$1

sudo docker tag drdroid/playbooks-web:$1 public.ecr.aws/y9s1f3r5/drdroid/playbooks-web:latest
sudo docker push public.ecr.aws/y9s1f3r5/drdroid/playbooks-web:latest