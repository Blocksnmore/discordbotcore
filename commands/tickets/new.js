exports.info = {
  command: "new",
  aliases: ["ticket"], // Leave empty for no aliases
  description: "Create a ticket",
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

  let userdata = db.get("userticketdata." + msg.author.id) || {};
  if (!userdata.opentickets)
    db.set("userticketdata." + msg.author.id + ".opentickets", 0);
  userdata = db.get("userticketdata." + msg.author.id);

  let ticketdata = db.get("ticketdata." + msg.guild.id) || {};
  if (!ticketdata.opentickets)
    db.set("ticketdata." + msg.guild.id + ".opentickets", 0);
  ticketdata = db.get("ticketdata." + msg.guild.id);

  if (userdata.opentickets >= tkconfig.maxtickets)
    return msg.channel.send(
      require("../../utils/embed.js")({
        title: "Unable to open ticket!",
        description:
          "You already have the max amount (" +
          tkconfig.maxtickets +
          ") of tickets open! \nClose a ticket to open a new one!",
      })
    );

  db.add("userticketdata." + msg.author.id + ".opentickets", 1);
  db.add("ticketdata." + msg.guild.id + ".opentickets", 1);
  msg.guild.channels
    .create("ticket-" + db.get("ticketdata." + msg.guild.id + ".opentickets"), {
      type: "text",
      parent: tkconfig.category,
      reason: "User opened ticket",
      permissionOverwrites: [
        { id: msg.guild.id, deny: ["VIEW_CHANNEL"] },
        { id: msg.author.id, allow: ["VIEW_CHANNEL"] },
        { id: bot.user.id, allow: ["VIEW_CHANNEL"] },
        { id: tkconfig.role, allow: ["VIEW_CHANNEL"] },
      ],
    })
    .then((c) => {
      db.set(
        "ticketdata." + msg.guild.id + ".ticketowner" + c.id,
        msg.author.id
      );
      db.set("ticketdata." + msg.guild.id + ".ticketmembers." + c.id, []);
      msg.channel.send(
        require("../../utils/embed.js")({
          title: "Opened ticket!",
          description:
            "Your ticket has been created! Please go to <#" + c.id + ">",
        })
      );
      let ping = "";
      if (tkconfig.pingsupport) ping = "<@&" + tkconfig.role + ">";
      c.send(
        msg.author.toString() + " " + ping,
        require("../../utils/embed.js")({
          title: "Welcome " + msg.author.tag,
          description:
            "Please explain your issue to our staff so they can assist you!",
        })
      );
      if (!tkconfig.logtickets) return;
      bot.channels.cache.get(tkconfig.logchannel).send(
        require("../../utils/embed.js")({
          title: "Ticket opened",
          description:
            "Ticket <#" +
            c.id +
            "> has been opened by " +
            msg.author.tag +
            " (" +
            msg.author.id +
            ")",
        })
      );
    });
};
