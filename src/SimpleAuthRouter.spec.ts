import express from "express";
import { stub } from "jest-auto-stub";
import request from "supertest";
import { ISimpleAuthRouterOptions } from "./ISimpleAuthRouterOptions";
import { SimpleAuthRouter } from "./SimpleAuthRouter";
import { AuthenticationResult, ConfidentialClientApplication } from "@azure/msal-node";

const acquireTokenOnBehalfOfMock = jest.fn().mockResolvedValue({});
let authenticateResultMock: any = null;

jest.mock("@azure/msal-node");
jest.mock("passport", () => {
    return {
        Passport: jest.fn().mockImplementation(() => {
            return {
                initialize: jest.fn().mockReturnValue((_req: any, _res: any, next: () => void) => { next(); }),
                use: jest.fn().mockReturnValue({}),
                authenticate: jest.fn().mockReturnValue((_req: any, _res: any, next: (a: any, b: any, c: any) => void) => { next(authenticateResultMock, {}, "asdf"); })
            }
        }),
        Strategy: jest.fn()
    }
});


describe("SimpleAuthRouter", () => {
    let app: express.Express;
    beforeEach(() => {
        jest.clearAllMocks();
        authenticateResultMock = null;
        (ConfidentialClientApplication as any).mockImplementation(() => {
            return {
                acquireTokenOnBehalfOf: acquireTokenOnBehalfOfMock
            }
        });

        app = express();
        app.use("/auth/token", SimpleAuthRouter({
            appId: "4cb0e766-c9f1-48ed-8304-6d576cca7670",
            appIdUri: "app://4cb0e766-c9f1-48ed-8304-6d576cca7670",
            appSecret: "secret",
            scopes: ["scope"],
            tenantId: "common"
        }));
    });

    it("Should return a 404 for a GET request", async () => {
        const response = await request(app).get("/auth/token").send();
        expect(response).toBeDefined();
        expect(response.statusCode).toEqual(404);
    });

    it("Should return a 401 for a POST request without auth header", async () => {
        const response = await request(app).post("/auth/token").send({});
        expect(response).toBeDefined();
        expect(acquireTokenOnBehalfOfMock).toBeCalledTimes(0);
        expect(response.statusCode).toEqual(401);
    });

    it("Should return a 500 for an invalid bearer token", async () => {
        authenticateResultMock = new Error();
        const response = await request(app).post("/auth/token").set("authorization", "Bearer dummy").send({});
        expect(response).toBeDefined();
        expect(acquireTokenOnBehalfOfMock).toBeCalledTimes(0);
        expect(response.statusCode).toEqual(500);
    });

    it("Should return a 500 for an invalid OBO call", async () => {
        acquireTokenOnBehalfOfMock.mockRejectedValueOnce("error");
        const response = await request(app).post("/auth/token").set("authorization", "Bearer dummy").send({});
        expect(response).toBeDefined();
        expect(acquireTokenOnBehalfOfMock).toBeCalledTimes(1);
        expect(response.statusCode).toEqual(500);
    });

    it("Should return a 401 for a POST request with invalid auth header", async () => {
        acquireTokenOnBehalfOfMock.mockResolvedValueOnce(null);
        const response = await request(app).post("/auth/token").set("authorization", "Bearer dummy").send({});
        expect(response).toBeDefined();
        expect(acquireTokenOnBehalfOfMock).toBeCalledTimes(1);
        expect(response.statusCode).toEqual(401);
    });

    it("Should return a 200 for a POST request with a valid auth header", async () => {
        acquireTokenOnBehalfOfMock.mockResolvedValueOnce(stub<AuthenticationResult>({ accessToken: "token", scopes: ["scope"], expiresOn: new Date(0) }));
        const response = await request(app).post("/auth/token").set("authorization", "Bearer dummy").send({});
        expect(response).toBeDefined();
        expect(acquireTokenOnBehalfOfMock).toBeCalledTimes(1);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ access_token: "token", scope: ["scope"], expires_on: "1970-01-01T00:00:00.000Z" })
    });
});
