import { env } from "@/env.js";

export interface APSAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class BaseAPSService {
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  protected constructor(
    private readonly clientId: string = env.FORGE_CLIENT_ID,
    private readonly clientSecret: string = env.FORGE_CLIENT_SECRET,
    private readonly scope = "data:read data:write data:create bucket:create bucket:read",
  ) {}

  protected async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    const params = new URLSearchParams();
    params.append("client_id", this.clientId);
    params.append("client_secret", this.clientSecret);
    params.append("grant_type", "client_credentials");
    params.append("scope", this.scope);

    const response = await fetch(
      "https://developer.api.autodesk.com/authentication/v2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = (await response.json()) as APSAuthResponse;
    this.accessToken = data.access_token;
    this.tokenExpiry = now + (data.expires_in * 1000 - 300000); // Expire 5 minutes early

    return this.accessToken;
  }

  protected async fetch(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const token = await this.getAccessToken();
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");

    return fetch(url, {
      ...options,
      headers,
    });
  }
}
