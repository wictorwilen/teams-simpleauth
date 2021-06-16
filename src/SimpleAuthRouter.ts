// Copyright (c) Wictor Wilén. All rights reserved.
// Licensed under the MIT license.

import { Router } from "express";
import { Passport } from "passport";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { ISimpleAuthRouterOptions } from "./ISimpleAuthRouterOptions";
import { SimpleAuthBearerStrategy } from "./SimpleAuthBearerStrategy";
import debug from "debug";

const log = debug("simpleauth");

/**
 * Creates the Teams Simpleauth router
 * @param options options for the router
 * @returns an Express router
 * @example
 * express.use("/auth/token", SimpleAuthRouter({
 *   appId: process.env.TAB_APP_ID as string,
 *   appIdUri: process.env.TAB_APP_URI as string,
 *   appSecret: process.env.TAB_APP_SECRET as string,
 *   scopes: ["Presence.Read"],
 *   tenantId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
* }));
 */
export const SimpleAuthRouter = (options: ISimpleAuthRouterOptions): Router => {
    const router = Router();

    const pass = new Passport();
    router.use(pass.initialize());
    pass.use(SimpleAuthBearerStrategy(options.appId, options.appIdUri));

    const confidentialClient = new ConfidentialClientApplication({
        auth: {
            clientId: options.appId,
            clientSecret: options.appSecret,
            authority: "https://login.microsoftonline.com/" + options.tenantId
        }
    });

    router.post("",
        pass.authenticate("oauth-bearer", { session: false }),
        async (req, res, next) => {
            const authHeader = req.headers.authorization;

            if (authHeader === undefined) {
                log("Missing authorization header");
                res.status(401).send();
                return;
            }

            confidentialClient.acquireTokenOnBehalfOf({
                oboAssertion: authHeader.split(" ")[1],
                scopes: options.scopes
            }).then(response => {
                if (response !== null) {
                    log("Successfully retrieved access token");
                    res.send(
                        {
                            access_token: response.accessToken,
                            scope: response.scopes,
                            expires_on: response.expiresOn
                        });
                } else {
                    log("No response from on-behalf-of request");
                    res.status(401).send();
                }

            }).catch(err => {
                log(`Error when requesting access token: ${err}`);
                res.status(500).send(err);
            });
        });

    return router;
};
