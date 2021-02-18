const { writeFileSync } = require("fs");
const path = require("path");

const { graphql } = require("@octokit/graphql");
const prettier = require("prettier");

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
    }
  }
`;

main();

async function main() {
  try {
    const { endpoints } = await graphql(QUERY, {
      // url: "https://github-openapi-graphql-server.vercel.app/api/graphql",
      url: "http://localhost:3000/api/graphql",
      version,
    });

    writeFileSync(
      path.resolve(__dirname, "generated", "endpoints.json"),
      prettier.format(JSON.stringify(endpoints), {
        parser: "json",
      })
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
