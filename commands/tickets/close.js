const { MessageAttachment } = require("discord.js");
exports.info = {
  command: "close",
  aliases: ["closeticket"], // Leave empty for no aliases
  description: "Close a ticket",
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
  msg.channel.send(
    require("../../utils/embed.js")({
      title: "Closing ticket!",
      description: "Closing ticket in 5 seconds!",
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
      if (tkconfig.sendtranscript)
        bot.users.cache
          .get(
            db.get(
              "ticketdata." + msg.guild.id + ".ticketowner" + msg.channel.id
            )
          )
          .send(
            require("../../utils/embed.js")({
              title: "Ticket closed!",
              description:
                "Your ticket in " +
                msg.guild.id +
                " has been closed! Attached is the transcript",
            })
          );
      if (tkconfig.sendtranscript)
        bot.users.cache
          .get(
            db.get(
              "ticketdata." + msg.guild.id + ".ticketowner" + msg.channel.id
            )
          )
          .send(
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
      if (tkconfig.logtickets)
        bot.channels.cache.get(tkconfig.logchannel).send(
          require("../../utils/embed.js")({
            title: "Ticket closed",
            description:
              msg.channel.name + " has been closed by " + msg.author.tag,
          })
        );
      if (tkconfig.logtickets)
        bot.channels.cache.get(tkconfig.logchannel).send(
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
  setTimeout(function () {
    msg.channel.delete();
    db.add(
      "userticketdata." +
        db.get("ticketdata." + msg.guild.id + ".ticketowner" + msg.channel.id) +
        ".opentickets",
      -1
    );
    db.delete("ticketdata." + msg.guild.id + ".ticketowner" + msg.channel.id);
    db.delete(
      "ticketdata." + msg.guild.id + ".ticketmembers." + msg.channel.id
    );
  }, 5000);
};

function formatmsg(json) {
  let returnmsg = `<div class="msg"><div class="text"><img src="${
    json.pfp
  }"/></div><p>${json.tag}     ${new Date(json.time).toString()}</p><p>${
    json.msg
  }</p>`;
  if (json.att)
    json.att.forEach((a) => {
      returnmsg += "<p>" + a + "</p>";
    });
  return returnmsg + "</div>";
}

function makehtml(html, json) {
  let returnmsg =
    `<div class="header1"><div class="header2"><img src="${json.icon}"/></div><p>${json.name}</p>` +
    `<p id="msgs">Collecting messages</p></div>`;
  returnmsg += html;
  returnmsg +=
    `<script>document.getElementById("msgs").innerHTML=document.querySelectorAll(".msg").length+" Messages";</script>` +
    `<style>@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;900&display=swap");body{background-color:#2c2f33;` +
    `color:white;font-family:"Montserrat";}img{max-width:100px;max-height:100px;border-radius:60px;margin-right:10px;line-height:150%;}div{` +
    `display:inline-block;vertical-align:top;padding:10px;}.msg{width:99%;background-color:#23272a;border-radius:25px;}.text{float:left;}` +
    `.header1{border-radius:25px;background-color:#7289da;width:99%;}.header2{float:left;}</style>`;
  return returnmsg;
}
