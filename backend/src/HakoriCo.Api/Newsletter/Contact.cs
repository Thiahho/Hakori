namespace HakoriCo.Api.Newsletter;

public class Contact
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public bool Unsubscribed { get; set; }
    public DateTimeOffset SubscribedAt { get; set; }
    public DateTimeOffset? UnsubscribedAt { get; set; }
    public string? ResendContactId { get; set; }
}
