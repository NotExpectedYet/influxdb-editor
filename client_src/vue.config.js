module.exports = {
  transpileDependencies: ["vuetify"],
  runtimeCompiler: true,

  pwa: {
    name: "QC"
  },

  outputDir: "dist",
  assetsDir: "src/assets",

  devServer: {
    disableHostCheck: true,
    port: 4545,
    proxy: {
      "^/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
        pathRewrite: { "^/api": "/api" }
      }
    }
  }
};
