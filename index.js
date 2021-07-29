const { Plugin } = require('powercord/entities');
const fs = require('fs');

ret = { result: "Something went wrong..." };

module.exports = class Share extends Plugin {
    startPlugin() {
        powercord.api.commands.registerCommand({
            command: 'share_plugin',
            usage: '{c} [plugin name]',
            description: 'Share a plugin you have in the chat',
            executor: this.share.bind(this),
            autocomplete: this.autocomplete.bind(this),
        });
    }

    pluginWillUnload() {
        powercord.api.commands.unregisterCommand('share_plugin');
    }

    share([id]) {
        if (powercord.pluginManager.plugins.has(id)) {
            const plugin = powercord.pluginManager.plugins.get(id);
            try {
                let data = fs.readFileSync(plugin.entityPath + '\\.git\\config', 'utf8');
                data = data.split('\n').map(e => e.trim());
                let url = "";
                for (var i=0;i<data.length;i++) {
                    if (data[i].startsWith("url = ")) {
                        url = data[i].replace(".git", "").replace("url = ", "");
                        break;
                    }
                }
                if (url !== "") {
                    console.log(url);
                    return { send: true, result: url };
                } else {
                    console.log(url);
                    return { result: "Unable to find a url in the .git config file." };
                }
            } catch (err) {
                console.log(err);
                return { result: "Unable to find the plugin's .git folder."};
            }
        }
    }

    autocomplete([findId, ...args]) {
        if (args.length) {
            return false;
        }
        return {
            commands: [...powercord.pluginManager.plugins]
            .filter(([id]) => id.includes(findId))
            .map(([id]) => ({ command: id })),
            header: 'plugins list',
        };
    }
}