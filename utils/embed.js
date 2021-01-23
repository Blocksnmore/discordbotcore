const { MessageEmbed } = require("discord.js");

module.exports = function (json) {
  let embed = new MessageEmbed();
  if (require("./yml.js")("./config/config.yml").bot.embed.color === "RANDOM") {
    embed.setColor(Math.floor(Math.random() * 16777214) + 1);
  } else {
    embed.setColor(require("./yml.js")("./config/config.yml").bot.embed.color);
  }
  if (json.title) embed.setTitle(json.title);
  if (json.description) embed.setDescription(json.description);
  if (json.image) embed.setImage(json.image);
  if (json.thumbnail) embed.setThumbnail(json.thumbnail);
  if (json.fields) embed.addFields(json.fields);
  if (json.author) embed.setTitle(json.author);
  if (json.footer) embed.setFooter(json.footer);
  embed.setTimestamp(Date.now());
  return embed;
};
