let modules = process.env.BABEL_ENV === 'commonjs' ? 'commonjs' : false;
module.exports = {
  presets: [['@babel/preset-env', { modules }], '@babel/preset-react'],
  plugins: [
    '@babel/plugin-proposal-class-properties'
  ],
};
