from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from accounts.forms import CustomUserCreationForm, CustomUserChangeForm
from accounts.models import User, Account, AccountApiToken, UserInvitation


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "created_at",
        "owner",
    ]


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User
    list_display = ("email", "account", "is_staff", "is_active",)
    list_filter = ("email", "account", "is_staff", "is_active",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "groups", "user_permissions")}),
        ("account", {"fields": ("account",)}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email", "password1", "password2", "is_staff",
                "is_active", "groups", "user_permissions", "account",
            )}
         ),
    )
    search_fields = ("email",)
    ordering = ("email",)


@admin.register(AccountApiToken)
class AccountApiTokenAdmin(admin.ModelAdmin):
    list_display = [
        "key",
        "account",
        "created_by",
        "created_at",
    ]
    search_fields = ("account",)
    list_filter = ("created_by", "account",)
    fieldsets = (
        (None, {"fields": ("account", "created_by")}),
    )


@admin.register(UserInvitation)
class UserInvitationAdmin(admin.ModelAdmin):
    list_display = [
        "email",
        "account",
        "invitee_user",
        "created_at",
        "joined_user_id",
    ]
