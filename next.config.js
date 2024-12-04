/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    }

    // 针对WASM文件的加载器配置
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    return config
  },
}

export default config;
