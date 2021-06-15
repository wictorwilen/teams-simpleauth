export interface ISimpleAuthRouterOptions {
    appId: string;
    appIdUri: string;
    appSecret: string;
    scopes: string[];
    tenantId: string | "common";
};
