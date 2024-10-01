from accounts.authentication import AccountApiTokenAuthentication
from accounts.cache import GLOBAL_ACCOUNT_API_TOKEN_CACHE
from accounts.models import AccountApiTokenUser


class SlackBotApiTokenAuthentication(AccountApiTokenAuthentication):
    def authenticate(self, request):
        key = request.GET.get('token')
        token = GLOBAL_ACCOUNT_API_TOKEN_CACHE.get(api_key=key)
        return AccountApiTokenUser(token.account_id, token.created_by.email), token
