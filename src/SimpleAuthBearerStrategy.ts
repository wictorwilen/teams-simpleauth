// Copyright (c) Wictor Wilén. All rights reserved.
// Licensed under the MIT license.

import { BearerStrategy, IBearerStrategyOption, ITokenPayload, VerifyCallback } from "passport-azure-ad";

/**
 * Creates a Passport Bearer strategy
 * @param clientID client id
 * @param audience audience
 * @param loggingLevel logging level
 * @returns a Passport Bearer strategy
 */
export const SimpleAuthBearerStrategy = (clientID: string, audience: string, loggingLevel = "warn") => new BearerStrategy({
    identityMetadata: "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
    clientID,
    audience,
    loggingLevel,
    validateIssuer: false,
    passReqToCallback: false
} as IBearerStrategyOption, (token: ITokenPayload, done: VerifyCallback) => {
    done(null, { tid: token.tid, name: token.name, upn: token.upn }, token);
}
);
