const { writeFileSync } = require("fs");
const path = require("path");

const graphql = require("github-openapi-graphql-query");
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
