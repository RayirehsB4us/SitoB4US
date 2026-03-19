import pluginId from './pluginId';

export default {
  register(app) {
    app.customFields.register({
      name: 'icon',
      pluginId,
      type: 'string',
      intlLabel: {
        id: `${pluginId}.icon.label`,
        defaultMessage: 'Material Icon',
      },
      intlDescription: {
        id: `${pluginId}.icon.description`,
        defaultMessage: 'Seleziona una icona Material Icons con anteprima',
      },
      components: {
        Input: async () =>
          import('./components/IconPickerInput'),
      },
      options: {
        base: [
          {
            sectionTitle: {
              id: `${pluginId}.icon.section`,
              defaultMessage: 'Impostazioni',
            },
            items: [
              {
                intlLabel: {
                  id: `${pluginId}.icon.required`,
                  defaultMessage: 'Campo obbligatorio',
                },
                name: 'required',
                type: 'checkbox',
                defaultValue: false,
              },
            ],
          },
        ],
        advanced: [
          {
            sectionTitle: {
              id: `${pluginId}.icon.advanced`,
              defaultMessage: 'Avanzate',
            },
            items: [
              {
                intlLabel: {
                  id: `${pluginId}.icon.defaultValue`,
                  defaultMessage: 'Valore predefinito',
                },
                name: 'options.default',
                type: 'text',
              },
            ],
          },
        ],
      },
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
