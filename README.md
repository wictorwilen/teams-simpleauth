
# teams-simpleauth

A node.js Microsoft Teams simpleauth implementation that works with the [@microsoft/teamsfx](https://www.npmjs.com/package/@microsoft/teamsfx) client side component.

## Installation 

Install with npm

```bash 
  npm install teams-simpleauth --save
```
    
## Documentation

### Prerequisites

A Teams Tab project using [Express.js](http://expressjs.com/) as a server side implementation, for instance a project scaffolded with [Yo Teams](https://aka.ms/yoteams)

### Installation and configuration

Start by installing the `teams-simpleauth` and `@microsoft/teamsfx` packages. The first one is used for the server side *exchange* of the token and the latter one is for the client side scripting.

``` bash
npm install teams-simpleauth @microsoft/teamsfx --save
```

Next, in your server side component add the following import. For *yo teams* based applications this is in the `src/server/server.ts` file.

``` Typescript
import { SimpleAuthRouter } from "teams-simpleauth";
```

And then after the express application is create add a statement like this to add and configure the router.

`appId`, `appIdUri` and `appSecret` are retrieved from the AAD application that is used for the Teams SSO Tab. `scopes` is an array of delegated permission scopes you would like for the returned access token and finally `tenantId` is either the ID of the tenant or set to `common` for multi-tenant applications.

``` Typescript
express.use("/auth/token", SimpleAuthRouter({
    appId: process.env.TAB_APP_ID as string,
    appIdUri: process.env.TAB_APP_URI as string,
    appSecret: process.env.TAB_APP_SECRET as string,
    scopes: ["Presence.Read"],
    tenantId: "00000000-0000-0000-0000-000000000000"
}));
```

In the client side code (tab) you need to import the `teamsfx` package as follows, and you use the package as described in the [`teamsfx` documentation](https://www.npmjs.com/package/@microsoft/teamsfx).

``` Typescript
import * as teamsFx from "@microsoft/teamsfx";
```


Example of tab using the `teamsfx` component in a *yo teams* based tab:

``` TypeScript
teamsFx.loadConfiguration({
    authentication: {
        initiateLoginEndpoint: `https://${process.env.PUBLIC_HOSTNAME}/ile`,
        clientId: process.env.TAB_APP_ID,
        tenantId: "00000000-0000-0000-0000-000000000000",
        authorityHost: "https://login.microsoftonline.com",
        applicationIdUri: process.env.TAB_APP_URI,
        simpleAuthEndpoint: `https://${process.env.PUBLIC_HOSTNAME}`
    }
});
const credential = new teamsFx.TeamsUserCredential();
const graphClient = teamsFx.createMicrosoftGraphClient(credential, ["Presence.Read"]);
const result = await graphClient.api("/me/presence").get();
setPresence(" is " + result.availability);
```
  
## License

[MIT](https://choosealicense.com/licenses/mit/)

  