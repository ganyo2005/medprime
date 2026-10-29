from django import forms


class SignupForm(forms.Form):
    """Extra signup field allauth composes into its own base signup form
    (see ACCOUNT_SIGNUP_FORM_CLASS) — the "full name (as it should appear on
    your certificate)" field the original Netlify Identity signup had."""

    full_name = forms.CharField(max_length=120, label="Full name")

    def signup(self, request, user):
        user.profile.full_name = self.cleaned_data["full_name"].strip()
        user.profile.save(update_fields=["full_name"])
