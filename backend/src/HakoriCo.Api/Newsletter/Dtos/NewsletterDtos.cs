namespace HakoriCo.Api.Newsletter.Dtos;

public record SubscribeRequest(string Email, string? Honeypot);

public record UnsubscribeRequest(string Email);

public record NewsletterResult(bool Ok, string? Error = null);
