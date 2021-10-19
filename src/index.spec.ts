import { SimpleAuthRouter, SimpleAuthBearerStrategy } from "./index";

describe("SimpleAuthRouter", () => {
    it("Should export SimpleAuthRouter", () => {
        expect(SimpleAuthRouter).toBeInstanceOf(Function);
    });
    it("Should export SimpleAuthBearerStrategy", () => {
        expect(SimpleAuthBearerStrategy).toBeInstanceOf(Function);
    });
})
