module.exports = {
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [
    '@storybook/preset-create-react-app',
    {
        name: "@storybook/addon-docs",
        options: {
            configureJSX: true,
        },
    },
    '@storybook/addon-actions',
    '@storybook/addon-links',
  ],
};
