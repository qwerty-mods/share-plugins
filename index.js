const { Plugin } = require('powercord/entities');
const { React } = require('powercord/webpack');
const fs = require('fs');
const path = require('path');

const Settings = require('./components/Settings');

module.exports = class Share extends Plugin {
  startPlugin () {
    powercord.api.settings.registerSettings(this.entityID, {
      category: this.entityID,
      label: 'Share Plugins',
      render: (p) =>
        React.createElement(Settings, { ...p })
    });
    powercord.api.commands.registerCommand({
      command: 'share_plugin',
      usage: '{c} [plugin name]',
      description: 'Share a plugin you have in the chat',
      executor: this.sharePlugin.bind(this),
      autocomplete: this.autocompletePlugins.bind(this)
    });
    powercord.api.commands.registerCommand({
      command: 'share_theme',
      usage: '{c} [theme name]',
      description: 'Share a theme you have in the chat',
      executor: this.shareTheme.bind(this),
      autocomplete: this.autocompleteThemes.bind(this)
    });
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings(this.entityID);
    powercord.api.commands.unregisterCommand('share_plugin');
    powercord.api.commands.unregisterCommand('share_theme');
  }


  formatUrl (url) {
    return url
      .replace('.git', '')
      .replace('git@github.com:', 'https://github.com/')
      .replace('url = ', '');
  }

  sharePlugin ([ id ]) {
    if (powercord.pluginManager.plugins.has(id)) {
      const plugin = powercord.pluginManager.plugins.get(id);
      try {
        let data = fs.readFileSync(path.resolve(plugin.entityPath, '.git', 'config'), 'utf8');
        data = data.split('\n').map(e => e.trim());
        let url = '';
        for (let i = 0; i < data.length; i++) {
          if (data[i].startsWith('url = ')) {
            url = this.formatUrl(data[i]);
            break;
          }
        }
        if (url !== '') {
          if (this.settings.get('linkEmbed', false)) {
            url = `<${url}>`;
          }
          return { send: true,
            result: url };
        }
        return { result: 'Unable to find a url in the .git config file.' };
      } catch (err) {
        console.log(err);
        return { result: 'Unable to find the plugin\'s .git folder.' };
      }
    }
  }


  shareTheme ([ id ]) {
    if (powercord.styleManager.themes.has(id)) {
      const theme = powercord.styleManager.themes.get(id);
      try {
        let data = fs.readFileSync(path.resolve(theme.entityPath, '.git', 'config'), 'utf8');
        data = data.split('\n').map(e => e.trim());
        let url = '';
        for (let i = 0; i < data.length; i++) {
          if (data[i].startsWith('url = ')) {
            url = this.formatUrl(data[i]);
            break;
          }
        }
        if (url !== '') {
          if (this.settings.get('linkEmbed', false)) {
            url = `<${url}>`;
          }
          return { send: true,
            result: url };
        }
        return { result: 'Unable to find a url in the .git config file.' };
      } catch (err) {
        console.log(err);
        return { result: 'Unable to find the theme\'s .git folder.' };
      }
    }
  }

  processName (name) {
    return name
      .toLowerCase()
      .replace(/[\s-_]/g, '');
  }

  filterMatches (matches, query) {
    query = this.processName(query);

    return [ ...matches ]
      .filter(([ id ]) => this.processName(id).includes(query) && !id.startsWith('pc-'))
      .map(([ id ]) => ({ command: id }));
  }

  autocompletePlugins ([ findId, ...args ]) {
    if (args.length) {
      return false;
    }
    return {
      commands: this.filterMatches(powercord.pluginManager.plugins, findId),
      header: 'plugins list'
    };
  }

  autocompleteThemes ([ findId, ...args ]) {
    if (args.length) {
      return false;
    }
    return {
      commands: this.filterMatches(powercord.pluginManager.themes, findId),
      header: 'themes list'
    };
  }
};
