/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    workerThreads: false,
    cpus: 1,
    allowedDevOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8000', 'http://127.0.0.1:8000']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones para CSS
    if (!isServer && !dev) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      };
    }
    
    return config;
  },
  // Configuración para PostCSS
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {
        flexbox: 'no-2009',
        grid: 'autoplace',
        overrideBrowserslist: [
          '> 1%',
          'last 2 versions',
          'Firefox ESR',
          'not dead'
        ]
      },
      'postcss-flexbugs-fixes': {},
      'postcss-preset-env': {
        autoprefixer: {
          flexbox: 'no-2009'
        },
        stage: 3,
        features: {
          'custom-properties': false
        }
      }
    }
  },
  // Configuración para evitar prerendering problemático
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' http://localhost:8000 http://127.0.0.1:8000; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: http://localhost:8000 http://127.0.0.1:8000; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 http://127.0.0.1:8005; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self';"
          }
        ]
      }
    ]
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'default_secret_key',
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
    NEXTAUTH_URL: 'http://localhost:3000'
  }
};

module.exports = nextConfig;
