import { Router } from "express";
import { Passport } from "passport";
import { BearerStrategy, IBearerStrategyOption, ITokenPayload, VerifyCallback } from "passport-azure-ad";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { ISimpleAuthRouterOptions } from "./ISimpleAuthRouterOptions";

export const simpleAuthRouter = (options: ISimpleAuthRouterOptions): Router => {
    const router = Router();

    // Set up the Bearer Strategy
    const bearerStrategy = new BearerStrategy({
        identityMetadata: "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
        clientID: options.appId,
        audience: options.appIdUri,
        loggingLevel: "warn",
        validateIssuer: false,
        passReqToCallback: false
    } as IBearerStrategyOption, (token: ITokenPayload, done: VerifyCallback) => {
        done(null, { tid: token.tid, name: token.name, upn: token.upn }, token);
    }
    );

    const pass = new Passport();
    router.use(pass.initialize());
    pass.use(bearerStrategy);

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
                res.status(401).send();
                return;
            }

            confidentialClient.acquireTokenOnBehalfOf({
                oboAssertion: authHeader.split(" ")[1],
                scopes: options.scopes
            }).then(response => {
                if (response !== null) {
                    res.send(
                        {
                            access_token: response.accessToken,
                            scope: response.scopes,
                            expires_on: response.expiresOn
                        });
                } else {
                    res.status(401).send();
                }

            }).catch(err => {
                res.status(500).send(err);
            });
        });

    return router;
};
