import pluginId from './pluginId';
import PluginIcon from './components/PluginIcon';

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'Environment Sync',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
      permissions: [],
    });

    app.registerPlugin({
      id: pluginId,
      initializer: () => null,
      isReady: true,
      name: pluginId,
    });
  },

  bootstrap() {},
};
