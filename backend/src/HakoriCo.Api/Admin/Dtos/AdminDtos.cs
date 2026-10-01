namespace HakoriCo.Api.Admin.Dtos;

public record AdminLoginRequest(string Email, string Password);

public record CreateAdminUserRequest(string Email, string Password);

public record AdminUserDto(Guid Id, string Email);

public record AdminVariantDto(
    Guid Id,
    string Size,
    string Sku,
    int Stock,
    int Reserved,
    decimal? ChestCm,
    decimal? LengthCm,
    decimal? SleeveCm);

public record AdminProductDto(
    Guid Id,
    string Index,
    string Slug,
    string Name,
    decimal Price,
    string Description,
    string Image,
    string StoryImage,
    string StoryQuote,
    string StoryText,
    bool IsActive,
    int SortOrder,
    List<AdminVariantDto> Variants);

public record CreateProductVariantInput(
    string Size,
    int Stock,
    decimal? ChestCm,
    decimal? LengthCm,
    decimal? SleeveCm);

public record CreateProductRequest(
    string Index,
    string Slug,
    string Name,
    decimal Price,
    string Description,
    string Image,
    string StoryImage,
    string StoryQuote,
    string StoryText,
    bool IsActive,
    int SortOrder,
    string SkuPrefix,
    List<CreateProductVariantInput> Variants);

public record UpdateProductVariantInput(
    Guid? Id,
    string Size,
    int Stock,
    decimal? ChestCm,
    decimal? LengthCm,
    decimal? SleeveCm);

public record UpdateProductRequest(
    string Index,
    string Slug,
    string Name,
    decimal Price,
    string Description,
    string Image,
    string StoryImage,
    string StoryQuote,
    string StoryText,
    bool IsActive,
    int SortOrder,
    string? SkuPrefix,
    List<UpdateProductVariantInput> Variants);

public record AdminOrderListItemDto(
    string OrderNumber,
    string Status,
    string Email,
    decimal Total,
    DateTimeOffset CreatedAt);

public record AdminOrderItemDto(string ProductName, string Size, decimal UnitPrice, int Quantity);

public record AdminOrderDetailDto(
    string OrderNumber,
    string Status,
    string Email,
    string ShippingName,
    string ShippingAddress,
    string ShippingCity,
    string ShippingPostalCode,
    string ShippingPhone,
    decimal Subtotal,
    decimal DiscountAmount,
    string? CouponCode,
    decimal Total,
    string? MercadoPagoPreferenceId,
    string? MercadoPagoPaymentId,
    DateTimeOffset CreatedAt,
    DateTimeOffset? PaidAt,
    DateTimeOffset? ExpiresAt,
    List<AdminOrderItemDto> Items);

public record AdminSubscriberDto(
    Guid Id,
    string Email,
    bool Unsubscribed,
    DateTimeOffset SubscribedAt,
    DateTimeOffset? UnsubscribedAt);

public record AdminCouponDto(
    Guid Id,
    string Code,
    string DiscountType,
    decimal Value,
    int? MaxUses,
    int UsedCount,
    DateTimeOffset? ExpiresAt,
    bool OnePerEmail,
    bool IsActive,
    string Status,
    DateTimeOffset CreatedAt);

/// <param name="Code">Empty = the backend generates a random code.</param>
/// <param name="DiscountType">"Percentage" or "FixedAmount".</param>
/// <param name="MaxUses">null = unlimited.</param>
public record SaveCouponRequest(
    string? Code,
    string DiscountType,
    decimal Value,
    int? MaxUses,
    DateTimeOffset? ExpiresAt,
    bool OnePerEmail,
    bool IsActive);

public record SetCouponActiveRequest(bool IsActive);

public record SizeChartRowDto(
    string Size,
    decimal? ChestCm,
    decimal? LengthCm,
    decimal? SleeveCm,
    int CurveUnits);

public record AdminSizeChartDto(Guid Id, string Name, List<SizeChartRowDto> Rows);

public record SaveSizeChartRequest(string Name, List<SizeChartRowDto> Rows);
