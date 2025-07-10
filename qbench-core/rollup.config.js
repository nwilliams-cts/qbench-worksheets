import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  // Main bundle - ES modules
  {
    input: 'src/qbench-worksheet.js',
    output: {
      file: 'dist/qbench-worksheet.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      copy({
        targets: [
          { src: 'src/styles/*.css', dest: 'dist/styles' },
          { src: 'src/styles/qbench-core.css', dest: 'dist', rename: 'qbench-core.css' },
          { src: 'examples/*', dest: 'dist/examples' },
          { src: 'azure-cdn-test.html', dest: 'dist' },
          { src: 'cdn-test.html', dest: 'dist' },
          { src: 'index.html', dest: 'dist' }
        ]
      })
    ]
  },
  
  // Main bundle - ES modules (minified)
  {
    input: 'src/qbench-worksheet.js',
    output: {
      file: 'dist/qbench-worksheet.esm.min.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      terser({
        compress: {
          drop_console: true
        }
      })
    ]
  },

  // UMD bundle for legacy compatibility
  {
    input: 'src/qbench-worksheet.js',
    output: {
      file: 'dist/qbench-worksheet.umd.js',
      format: 'umd',
      name: 'QBenchWorksheet',
      sourcemap: true
    },
    plugins: [
      nodeResolve()
    ]
  },

  // UMD bundle (minified)
  {
    input: 'src/qbench-worksheet.js',
    output: {
      file: 'dist/qbench-worksheet.umd.min.js',
      format: 'umd',
      name: 'QBenchWorksheet',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      terser({
        compress: {
          drop_console: true
        }
      })
    ]
  }
];
