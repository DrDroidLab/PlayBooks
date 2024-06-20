import boto3
import time
import paramiko
import os

import random

# Configuration
AMI_ID = 'ami-03bf4378d3846dc1f'  # Replace with your AMI ID
INSTANCE_TYPE = 't2.xlarge'
KEY_NAME = 'codexplore'  # Replace with your key name
SECURITY_GROUP_NAME = 'playbooks-automation-security-group-{}'.format(random.randint(1, 1000))
GITHUB_REPO_URL = 'https://github.com/DrDroidLab/PlayBooks.git'  # Replace with your repo URL
REGION = 'us-west-2'  # Replace with your desired region
USERNAME = 'ec2-user'  # Adjust according to the AMI's default username (e.g., 'ubuntu' for Ubuntu AMIs)
PRIVATE_KEY_PATH = '../../codexplore.pem'  # Replace with the path to your private key

# Initialize boto3 clients
ec2_client = boto3.client('ec2', region_name=REGION)

# Create Security Group
def create_security_group():
    response = ec2_client.create_security_group(
        GroupName=SECURITY_GROUP_NAME,
        Description='Security group for my EC2 instance'
    )
    security_group_id = response['GroupId']
    
    ec2_client.authorize_security_group_ingress(
        GroupId=security_group_id,
        IpPermissions=[
            {'IpProtocol': 'tcp', 'FromPort': 22, 'ToPort': 22, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 80, 'ToPort': 80, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp', 'FromPort': 5432, 'ToPort': 5432, 'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
        ]
    )
    return security_group_id

# Create EC2 instance
def create_instance(security_group_id):
    response = ec2_client.run_instances(
        ImageId=AMI_ID,
        InstanceType=INSTANCE_TYPE,
        KeyName=KEY_NAME,
        SecurityGroupIds=[security_group_id],
        MinCount=1,
        MaxCount=1
    )
    instance_id = response['Instances'][0]['InstanceId']
    return instance_id

# Wait for instance to be running
def wait_for_instance(instance_id):
    ec2_client.get_waiter('instance_running').wait(InstanceIds=[instance_id])

# Get instance public DNS
def get_instance_dns(instance_id):
    response = ec2_client.describe_instances(InstanceIds=[instance_id])
    public_dns = response['Reservations'][0]['Instances'][0]['PublicDnsName']
    return public_dns

# SSH into instance and run commands
def run_commands_on_instance(instance_dns):
    key = paramiko.RSAKey.from_private_key_file(PRIVATE_KEY_PATH)
    ssh_client = paramiko.SSHClient()
    ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    print("SSH into instance: ", instance_dns)
    ssh_client.connect(hostname=instance_dns, username=USERNAME, pkey=key)
    
    commands = [
        f'git clone {GITHUB_REPO_URL}',
        'cd PlayBooks',  # Adjust with your repo name
        'git checkout integration',  # Adjust with your repo name
        'sudo /usr/local/bin/docker-compose -f playbooks.docker-compose.yaml up -d'
    ]
    
    for command in commands:
        print("Executing command: ", command)
        stdin, stdout, stderr = ssh_client.exec_command(command)
        print(stdout.read().decode())
        print(stderr.read().decode())
    
    ssh_client.close()

def terminate_instance(instance_id):
    response = ec2_client.terminate_instances(InstanceIds=[instance_id])
    return response

# Main function
def main():
    # security_group_id = create_security_group()
    # instance_id = create_instance(security_group_id)
    # print("Instance ID: ", instance_id)
    # time.sleep(60)
    # wait_for_instance(instance_id)
    # public_dns = get_instance_dns("i-0b22d7897febfe012") #instance_id)
    # run_commands_on_instance(public_dns)
    
    # # Check if the service is up
    # response = os.system(f"curl http://{public_dns}")
    # if response == 0:
    #     print("Deployed successfully - {}".format(f"http://{public_dns}"))
    # else:
    #     print("Deployment failed")

    instance_id = 'i-0ef85d4ad0dab2f1f'
    terminate_instance(instance_id)

if __name__ == "__main__":
    main()