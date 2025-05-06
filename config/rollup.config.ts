import { RollupOptions } from "rollup"
import dts from "rollup-plugin-dts"
import esbuild from "rollup-plugin-esbuild"
import terser from "@rollup/plugin-terser"
import copy from "rollup-plugin-copy"
import json from "@rollup/plugin-json"
import { typescriptPaths } from "rollup-plugin-typescript-paths"

const external = [""]

const config: RollupOptions[] = [
  {
    input: "src/index.ts",
    treeshake: false,
    output: [
      {
        file: `dist/index.mjs`,
        format: "es",
        sourcemap: false,
      },
      {
        file: `dist/index.js`,
        format: "cjs",
        sourcemap: false,
      },
    ],
    external: (name) => external.includes(name),
    plugins: [json(), typescriptPaths(), esbuild(), terser()],
  },
  {
    input: "src/index.ts",
    external: (name) => external.includes(name),
    plugins: [
      json(),
      typescriptPaths(),
      dts(),
      copy({
        targets: [
          { src: "README.md", dest: "dist" },
          {
            src: "package.json",
            dest: "dist",
          },
          { src: "LICENSE", dest: "dist" },
          { src: "README.md", dest: "dist" },
        ],
      }),
    ],
    output: {
      file: `dist/index.d.ts`,
      format: "es",
    },
  },
]

export default config
