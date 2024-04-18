from collections import Counter

from allauth.account.signals import email_confirmed
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import User, Account, AccountApiToken
from playbooks.utils.decorators import skip_signal

PUBLIC_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'zoho.com']


def get_account_for_user(instance: User) -> Account:
    user_email = instance.email
    user_domain = user_email.split('@')[1]

    account = None
    found_associated_account = False

    if user_domain not in PUBLIC_EMAIL_DOMAINS:
        existing_same_domain_users = User.objects.filter(email__contains=user_domain, is_staff=False,
                                                         is_active=True).exclude(id=instance.id)
        if existing_same_domain_users.exists():
            attribute_counter = Counter(getattr(obj, 'account_id') for obj in existing_same_domain_users)
            most_common_account_id, count = attribute_counter.most_common(1)[0]
            most_common_account_user = next(
                obj for obj in existing_same_domain_users if getattr(obj, 'account_id') == most_common_account_id)
            account = most_common_account_user.account
            found_associated_account = True
            print(f'Found Associated account for user: {instance}')

    if not found_associated_account:
        account = Account(owner=instance)
        account.save()
        print(f'Created account for user: {instance}')

    return account


@receiver(post_save, sender=User)
@skip_signal()
def create_user_account(sender, instance, created, **kwargs):
    instance.skip_signal = True

    if not created:
        return
    if instance.account:
        return
    if instance.is_staff:
        return

    account, _ = Account.objects.get_or_create(id=1)
    if not account.owner:
        if not account.is_whitelisted:
            account.is_whitelisted = True
        account.owner = instance
        account.save()

    instance.account = account
    instance.save()
    print(f'Associated account for user: {instance}')
    print(f'Created account setup task for: {instance}')
    log_dict = {"msg": "Signup_New_User", "user_email": instance.email, "user_id": instance.id}
    print(log_dict)


@receiver(email_confirmed)
def generate_account_token_on_email_confirmed(request, email_address, **kwargs):
    user_model = get_user_model()
    try:
        user = user_model.objects.get(email=email_address)
        account = Account.objects.get(owner=user)
        token = AccountApiToken(account=account, created_by=user)
        token.save()
        print(f'Created account api token for account: {account}')
    except Exception as e:
        pass
