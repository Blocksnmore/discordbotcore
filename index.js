const discord = require("discord.js");
const fs = require("fs");
const db = require("quick.db");
const config = require("./utils/yml.js")("./config/config.yml");
const bot = new discord.Client({
  partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
});
var commands = new Map();
var usercooldown = new Map();

bot.on("ready", async () => {
  console.log("Starting discord bot!");
  console.log("Loading all commands!");
  await fs.readdir("./commands/", (err, files) => {
    let directories = files.filter((f) => !f.includes("."));
    let cmds = files.filter(
      (f) => f.toLowerCase().endsWith(".js") || f.toLowerCase().endsWith(".ts")
    );
    if (cmds.size < 1)
      console.log(
        "No commands in the main directory found! Loading subdirectories"
      );
    else
      cmds.forEach((cmd) => {
        let data = require("./commands/" + cmd).info;
        commands.set(data.command, "./commands/" + cmd);
        if (data.aliases.length > 0)
          data.aliases.forEach((alias) => {
            commands.set(alias, "./commands/" + cmd);
          });
      });
    directories.forEach((dir) => {
      fs.readdir("./commands/" + dir, (err, command) => {
        command = command.filter(
          (f) =>
            f.toLowerCase().endsWith(".js") || f.toLowerCase().endsWith(".ts")
        );
        command.forEach((cmd) => {
          let data = require("./commands/" + dir + "/" + cmd).info;
          commands.set(data.command, "./commands/" + dir + "/" + cmd);
          if (data.aliases.length > 0)
            data.aliases.forEach((alias) => {
              commands.set(alias, "./commands/" + dir + "/" + cmd);
            });
        });
      });
    });
  });
  console.log("Loaded commands!");
  console.log("Loading all modules!");
  if (!fs.existsSync("./modules/")) console.log("No modules found!");
  else
    await fs.readdir("./modules/", (err, files) => {
      let file = files.filter(
        (f) =>
          f.toLowerCase().endsWith(".js") || f.toLowerCase().endsWith(".ts")
      );
      console.log("Loading " + file.length + " modules");
      file.forEach((f) => {
        require("./modules/" + f).init(this); // Passes `this` instance to all modules allowing for stuff like more events
      });
    });
  console.log("Loaded all modules!");
  console.log("Bot started!");
  bot.user.setPresence({
    status: config.bot.status.status,
    activity: { name: config.bot.status.message, type: config.bot.status.type },
  });
});

bot.on("message", async (msg) => {
  if (msg.author.bot || msg.channel.type === "dm") return;
  for (let p in config.bot.prefixes) {
    p = config.bot.prefixes[p];
    if (!msg.content.toLowerCase().startsWith(p.toLowerCase())) continue;
    let args = msg.content.toString().split(" ");
    let command = args[0].toLowerCase().substring(p.length);
    if (!commands.has(command)) return;
    if (usercooldown.has(msg.author.id))
      return msg.channel.send(
        require("./utils/embed.js")({
          title: "Slow down!",
          description:
            "You are currently on cooldown!\nPlease wait " +
            (
              (Date.now() + 4000 - usercooldown.get(msg.author.id)) /
              1000
            ).toFixed(1) +
            " seconds before running a new command!",
        })
      );
    usercooldown.set(msg.author.id, Date.now());
    setTimeout(function () {
      usercooldown.delete(msg.author.id);
    }, 5000);
    await require(commands.get(command)).run(bot, msg, db);
  }
});

bot.login(config.bot.token);
