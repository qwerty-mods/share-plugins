const { Plugin } = require('powercord/entities');
const { React, getModule, constants: { ComponentActions } } = require('powercord/webpack');
const fs = require('fs');
const path = require('path');

const Settings = require('./components/Settings');

const { openURL } = getModule([ 'openURL' ], false);
const { ComponentDispatch } = getModule([ 'ComponentDispatch' ], false);

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

  share (data, args) {
    data = data.split('\n').map(e => e.trim());
    let url = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i].startsWith('url = ')) {
        url = this.formatUrl(data[i]);
        break;
      }
    }
    if (url !== '') {
      if (args.includes('--open')) {
        openURL(url);
        return;
      }
      if ((this.settings.get('linkEmbed', false) || args.includes('--no-embed')) && !args.includes('--embed')) {
        url = `<${url}>`;
      }
      if (args.includes('--no-send')) {
        this.appendText(url);
        return;
      }
      return {
        send: true,
        result: url
      };
    }
    return { result: 'Unable to find a url in the .git config file.' };
  }

  sharePlugin ([ id, ...args ]) {
    if (powercord.pluginManager.plugins.has(id)) {
      const plugin = powercord.pluginManager.plugins.get(id);
      try {
        const data = fs.readFileSync(path.resolve(plugin.entityPath, '.git', 'config'), 'utf8');
        return this.share(data, args);
      } catch (err) {
        console.log(err);
        return { result: 'Unable to find the plugin\'s .git folder.' };
      }
    }
  }

  shareTheme ([ id, ...args ]) {
    if (powercord.styleManager.themes.has(id)) {
      const theme = powercord.styleManager.themes.get(id);
      try {
        const data = fs.readFileSync(path.resolve(theme.entityPath, '.git', 'config'), 'utf8');
        return this.share(data, args);
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

  autocompleteFlags (args) {
    const lastArg = args[args.length - 1].toLowerCase();
    if (!lastArg.startsWith('-')) {
      return false;
    }
    const flags = [ '--open', '--no-send', '--embed', '--no-embed' ];
    return {
      commands: flags.filter(flag => flag.startsWith(lastArg) && !args.includes(flag))
        .map(x => ({ command: x })),
      header: 'options list'
    };
  }

  autocompletePlugins ([ findId, ...args ]) {
    if (args.length) {
      return this.autocompleteFlags(args);
    }
    return {
      commands: this.filterMatches(powercord.pluginManager.plugins, findId),
      header: 'plugins list'
    };
  }

  autocompleteThemes ([ findId, ...args ]) {
    if (args.length) {
      return this.autocompleteFlags(args);
    }
    return {
      commands: this.filterMatches(powercord.styleManager.themes, findId),
      header: 'themes list'
    };
  }

  appendText (text) {
    ComponentDispatch.dispatchToLastSubscribed(
      ComponentActions.TEXTAREA_FOCUS
    );
    setTimeout(() => {
      ComponentDispatch.dispatchToLastSubscribed(ComponentActions.INSERT_TEXT, {
        plainText: text,
        rawText: text
      });
    }, 0);
  }
};
