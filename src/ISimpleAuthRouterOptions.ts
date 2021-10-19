// Copyright (c) Wictor Wilén. All rights reserved.
// Licensed under the MIT license.
/**
 * Options for the Teams Simpleauth router
 */
export interface ISimpleAuthRouterOptions {
    /**
     * The application/client id
     */
    appId: string;
    /**
     * The application/client id URI
     */
    appIdUri: string;
    /**
     * The appclication/client secret required for the on-behalf-of OAuth flow
     */
    appSecret: string;
    /**
     * Scopes requested
     */
    scopes: string[];
    /**
     * Tenant id or "common" for multi-tenant applications
     */
    tenantId: string | "common";
};
