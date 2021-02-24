const { MessageAttachment } = require("discord.js")
exports.info = {
  command: "transcript",
  aliases: ["tickettranscript"], // Leave empty for no aliases
  description: "Transcript for tickets",
};

exports.run = async function (bot, msg, db) {
  let tkconfig = require("../../utils/yml.js")("./config/commands/ticket.yml");
  if (!tkconfig.enabled)
    return msg.channel.send(
      require("../../utils/embed.js")({
        title: "Command disabled!",
        description: "The `TICKET` commands are currently disabled!",
      })
    );
  if (
    !db.get("ticketdata." + msg.guild.id + ".ticketmembers." + msg.channel.id)
  )
    return msg.channel.send(
      require("../../utils/embed.js")({
        title: "Invalid ticket!",
        description: "This is not a ticket channel!",
      })
    );
  msg.channel.messages
    .fetch({
      limit: require("../../utils/yml.js")("./config/commands/ticket.yml")
        .msglimit,
    })
    .then(async (message) => {
      message = message.array().reverse();
      var transcript = "";
      message.forEach((m) => {
        if (m.attachments.size > 0) {
          let attachments = [];
          m.attachments.forEach((att) => {
            attachments.push(att.url);
          });
          transcript += formatmsg({
            pfp: m.author.avatarURL(),
            tag: m.author.tag,
            msg: m.content,
            att: attachments,
            time: m.createdTimestamp,
          });
        } else {
          transcript += formatmsg({
            pfp: m.author.avatarURL(),
            tag: m.author.tag,
            msg: m.content,
            time: m.createdTimestamp,
          });
        }
      });
      msg.channel.send(
        require("../../utils/embed.js")({
          title: "Created transcript!",
          description: "I have created the transcript! Please check your dms.",
        })
      );
      msg.author.send(
        new MessageAttachment(
          Buffer.from(
            makehtml(transcript, {
              icon: msg.guild.iconURL(),
              name: msg.guild.name,
            })
          ),
          "Transcript-" + msg.channel.name + ".html"
        )
      );
    });
};
function formatmsg(params) {
  return require("./close.js").formatmsg(params);
}
function makehtml(params, paramstwo) {
  return require("./close.js").makehtml(params, paramstwo);
}
