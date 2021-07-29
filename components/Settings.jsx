const { React } = require('powercord/webpack')
const { SwitchItem } = require('powercord/components/settings')

module.exports = ({ getSetting, toggleSetting }) => <>
    <SwitchItem
        value={getSetting('linkEmbed', false)}
        onChange={() => {
            toggleSetting('linkEmbed', false)
        }}
        note="When enabled, plugin links sent will not show an embed."
    >Hide Link Embed</SwitchItem>
</>
