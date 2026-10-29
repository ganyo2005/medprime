from allauth.headless.adapter import DefaultHeadlessAdapter


class HeadlessAdapter(DefaultHeadlessAdapter):
    """Adds full_name (accounts.Profile, not part of allauth's own user
    model) to the serialized user payload every headless response returns,
    so the frontend dashboard can show it without a second request."""

    def serialize_user(self, user):
        data = super().serialize_user(user)
        full_name = getattr(getattr(user, "profile", None), "full_name", "")
        if full_name:
            data["full_name"] = full_name
        return data
