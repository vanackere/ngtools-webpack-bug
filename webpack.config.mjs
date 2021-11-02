import { AngularWebpackPlugin } from '@ngtools/webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { GLOBAL_DEFS_FOR_TERSER_WITH_AOT } from '@angular/compiler-cli';

export default function (env, argv) {
  if (!env) {
    env = {};
  }
  var production = !!env.prod;
  var watch = !!argv['watch'];
  console.log('Production:', production);
  console.log('Watch', watch);

  var angularGlobalDefinitions = {
    ngDevMode: false,
    ngI18nClosureMode: false,
  };

  // Try to load known global definitions from @angular/compiler-cli.
  if (GLOBAL_DEFS_FOR_TERSER_WITH_AOT) {
    angularGlobalDefinitions = GLOBAL_DEFS_FOR_TERSER_WITH_AOT;
  }

  var config = {
    mode: production ? 'production' : 'development',
    performance: false,
    entry: {
      app: './src/main.ts'
    },

    watchOptions: {
      ignored: /node_modules/
    },

    optimization: {
      emitOnErrors: false,
      concatenateModules: !watch,
      splitChunks: {
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "all",
            enforce: true,
            priority: -10
          },
        }
      },
      minimizer: [new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 5,
          compress: {
            global_defs: angularGlobalDefinitions
          },
          safari10: true
        }
      })]
    },

    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.ts$/,
          loader: '@ngtools/webpack',
          exclude: /node_modules/
        },
        {
          test: /\.(css|html)$/,
          type: 'asset/source',
          exclude: /node_modules/,
        },
        {
          test: /\.(woff|svg|ttf|eot)([\?]?.*)$/,
          type: 'asset/resource',
          generator: {
            filename: '[name][ext]'
          },
          exclude: /node_modules/
        },
        {
          test: /\.(png|jpg)([\?]?.*)$/,
          type: 'asset/resource',
          generator: {
            filename: '[name][ext]'
          },
          exclude: /node_modules/
        }
      ]
    },
    output: {
      globalObject: 'self',
      filename: '[name].js',
      chunkFilename: '[name].bundle.js',
      publicPath: '/app/',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      mainFields: ['es2015', 'browser', 'module', 'main']
    },
    devtool: (watch && !production) ? 'eval-cheap-module-source-map' : 'source-map',
    plugins: [
      new AngularWebpackPlugin({
        tsConfigPath: './tsconfig.app.json'
      })
    ],
    node: false,
  };
  return config;
};
