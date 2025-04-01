import {Configuration} from "@azure/msal-browser";

export const msalConfig: Configuration = {

    auth: {
        // clientId: window.AZURE_CLIENT_ID,
        clientId: "2d9ce518-7fcf-4778-b0a7-d5f5879339b0",
        authority: "https://login.microsoftonline.com/organizations/f1640c14-f2cd-4607-b90a-ec03d1b46437",
        redirectUri: "localhost:3001"
        // authority: window.AZURE_AUTHORITY_URL + window.AZURE_TENANT_ID,
        // redirectUri: window.AZURE_REDIRECT_URL,
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    }
};

export const loginRequest = {
    scopes: ["openid", "profile", "user.read"]
};