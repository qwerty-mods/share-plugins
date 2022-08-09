const { React } = require('powercord/webpack')
const { SwitchItem } = require('powercord/components/settings')

module.exports = ({ getSetting, toggleSetting }) => <>
    <SwitchItem
        value={getSetting('linkEmbed', false)}
        onChange={() => {
            toggleSetting('linkEmbed', false)
        }}
        note="When enabled, plugin and theme links sent will not show an embed."
    >Hide Link Embed</SwitchItem>
    <SwitchItem
        value={getSetting('repo', false)}
        onChange={() => {
            toggleSetting('repo', false)
        }}
        note="When enabled, plugin and theme links will be sent as the repo link, not the installer link."
    >Send As Repo</SwitchItem>
</>
