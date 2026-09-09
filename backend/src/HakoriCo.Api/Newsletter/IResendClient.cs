namespace HakoriCo.Api.Newsletter;

public interface IResendClient
{
    /// <summary>Creates or updates the contact's subscription state in the Resend Audience. Returns the Resend contact id, or null if Resend isn't configured.</summary>
    Task<string?> UpsertAudienceContactAsync(string email, bool unsubscribed, CancellationToken ct = default);

    Task SendWelcomeEmailAsync(string toEmail, string siteUrl, string unsubscribeUrl, CancellationToken ct = default);
}
