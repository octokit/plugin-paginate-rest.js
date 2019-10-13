# plugin-paginate-rest.js

> Octokit plugin to paginate REST API endpoint responses

[![@latest](https://img.shields.io/npm/v/@octokit/plugin-paginate-rest.svg)](https://www.npmjs.com/package/@octokit/plugin-paginate-rest)
[![Build Status](https://github.com/octokit/plugin-paginate-rest.js/workflows/Test/badge.svg)](https://github.com/octokit/plugin-paginate-rest.js/actions?workflow=Test)
[![Greenkeeper](https://badges.greenkeeper.io/octokit/plugin-paginate-rest.js.svg)](https://greenkeeper.io/)

## Usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>

Load `@octokit/plugin-paginate-rest` and [`@octokit/core`](https://github.com/octokit/core.js) (or core-compatible module) directly from [cdn.pika.dev](https://cdn.pika.dev)

```html
<script type="module">
  import { Octokit } from "https://cdn.pika.dev/@octokit/core";
  import { paginateRest } from "https://cdn.pika.dev/@octokit/plugin-paginate-rest";
</script>
```

</td></tr>
<tr><th>
Node
</th><td>

Install with `npm install @octokit/core @octokit/plugin-paginate-rest`. Optionally replace `@octokit/core` with a core-compatible module

```js
const { Octokit } = require("@octokit/core");
const { paginateRest } = require("@octokit/plugin-paginate-rest");
```

</td></tr>
</tbody>
</table>

```js
const MyOctokit = Octokit.plugin(paginateRest);
const octokit = new MyOctokit({ auth: "secret123" });

// See https://developer.github.com/v3/issues/#list-issues-for-a-repository
const issues = await octokit.paginate("GET /repos/:owner/:repo/issues", {
  owner: "octocat",
  repo: "hello-world",
  since: "2010-10-01"
});
```

## License

[MIT](LICENSE)
