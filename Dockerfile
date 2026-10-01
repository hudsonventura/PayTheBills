# Stage 1: Build React Frontend
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server-builder
WORKDIR /src
COPY server/server.csproj server/
RUN dotnet restore server/server.csproj
COPY server/ server/
# Copy built React assets directly into server/wwwroot
COPY --from=client-builder /app/client/dist server/wwwroot
RUN dotnet publish server/server.csproj -c Release -o /app/publish

# Stage 3: Unified Runtime Container
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=server-builder /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "server.dll"]

