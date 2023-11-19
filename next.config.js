/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/recursive-sound',
  webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webm)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/[path][name].[hash][ext]',
      },
    });
    config.module.rules.push({
      test: /\.wgsl$/i,
      use: 'raw-loader',
    });
    config.plugins.push(
      new webpack.DefinePlugin({
        __SOURCE__: webpack.DefinePlugin.runtimeValue((v) => {
          // Load the source file and set it as a global definition.
          // This is useful for easily embedding a file's source into the page.
          let filePath = v.module.rawRequest;
          filePath = filePath.replace(
            'private-next-pages',
            path.join(__dirname, 'src/pages')
          );

          if (!path.isAbsolute(filePath)) {
            // Path is relative to some path in src/pages/samples.
            filePath = path.resolve(
              path.join(__dirname, 'src', 'pages', 'samples'),
              filePath
            );
            filePath = `${filePath}.ts`;
          }

          const source = fs.readFileSync(filePath, 'utf-8');
          return JSON.stringify(source); // Strings need to be wrapped in quotes
        }, []),
      })
    );

    if (!config.node) {
      config.node = {};
    }

    config.node.__filename = true;
    config.node.__dirname = true;

    return config;
  },
}

module.exports = nextConfig;
