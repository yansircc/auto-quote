import { env } from "@/env.js";

interface APSTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Utility class for APS (Autodesk Platform Services) authentication and API calls
 */
export class APSService {
  private static instance: APSService;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): APSService {
    if (!APSService.instance) {
      APSService.instance = new APSService();
    }
    return APSService.instance;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  public async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const clientId = env.FORGE_CLIENT_ID;
    const clientSecret = env.FORGE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("APS credentials not configured");
    }

    // Create Basic auth string
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64",
    );

    const response = await fetch(
      "https://developer.api.autodesk.com/authentication/v2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          scope: "data:read data:write bucket:create bucket:delete",
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = (await response.json()) as APSTokenResponse;
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

    return this.accessToken;
  }

  /**
   * Helper method to make authenticated requests to APS APIs
   */
  public async fetch(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const token = await this.getAccessToken();

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(url, {
      ...options,
      headers,
    });
  }
}
