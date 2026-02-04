module.exports = {
  apps: [{
    name: "velox",
    script: "./src/index.ts",
    interpreter: "node",
    interpreter_args: "--loader ts-node/esm --experimental-specifier-resolution=node",
    env: {
      NODE_ENV: "development"
    }
  }]
}
