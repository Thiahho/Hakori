FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY src/HakoriCo.Api/HakoriCo.Api.csproj src/HakoriCo.Api/
RUN dotnet restore src/HakoriCo.Api/HakoriCo.Api.csproj
COPY src/ src/
RUN dotnet publish src/HakoriCo.Api/HakoriCo.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_HTTP_PORTS=10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "HakoriCo.Api.dll"]
