const preferValidatedGettersRule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce usage of validated getters (getValidatedQuery, readValidatedBody) in Nuxt event handlers.",
    },
    schema: [],
    messages: {
      preferValidatedQuery:
        "Use getValidatedQuery(event, schema) instead of getQuery(event) for better type safety.",
      preferValidatedBody:
        "Use readValidatedBody(event, schema) instead of readBody(event) for better type safety.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee?.type !== "Identifier") {
          return;
        }

        if (node.callee.name === "getQuery") {
          context.report({
            node,
            messageId: "preferValidatedQuery",
          });
        }

        if (node.callee.name === "readBody" || node.callee.name === "getBody") {
          context.report({
            node,
            messageId: "preferValidatedBody",
          });
        }
      },
    };
  },
};

const plugin = {
  meta: {
    name: "h3-safety",
  },
  rules: {
    "prefer-validated-getters": preferValidatedGettersRule,
  },
};

export default plugin;
