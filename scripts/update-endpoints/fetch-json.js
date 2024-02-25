import { writeFileSync } from "node:fs";

import graphql from "github-openapi-graphql-query";
import prettier from "prettier";

if (!process.env.VERSION) {
  throw new Error("VERSION environment variable must be set");
}

const version = process.env.VERSION.replace(/^v/, "");

const QUERY = `
  query($version: String) {
    endpoints(version: $version) {
      url
      id
      scope
      documentationUrl
      renamed {
        note
      }
      responses {
        code
        schema
      }
      parameters {
        name
      }
    }
  }
`;

main();

async function main() {
  try {
    const {
      data: { endpoints },
    } = await graphql(QUERY, {
      version,
    });

    writeFileSync(
      new URL("./generated/endpoints.json", import.meta.url),
      await prettier.format(JSON.stringify(endpoints), {
        parser: "json",
      }),
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
