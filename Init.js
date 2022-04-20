const {Client, Intents, MessageEmbed} = require("discord.js")
const {joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, AudioPlayerStatus} = require("@discordjs/voice")

const YTDLcore = require("ytdl-core")
const SPDLcore = require("spdl-core")

const Fs = require("fs")
const {join} = require("path");

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING,
                                    Intents.FLAGS.GUILD_VOICE_STATES]});
const Prefix = ";";
const Player = createAudioPlayer();
const AuthorID = "529926127477850112"

var Loop = false;
var PauseBool = false

async function Play(Spec_Client, Spec_URL,  Spec_Message){
    var Stream;

    /*
    VALIDATE
    */

    if(SPDLcore.validateURL(Spec_URL) == true){
        Stream = await SPDLcore(Spec_URL)
    }
    else{
        //highWaterMark repaired the Error: imput stream: aborted error. Solution is on https://github.com/fent/node-ytdl-core/issues/902
        Stream = YTDLcore(Spec_URL, {filter: "audioonly", highWaterMark: 1 << 25})
    }

    /*
    PLAY
    */

    var ChannelID = Spec_Message.member.voice.channelId
    var Channel = Spec_Client.channels.cache.get(ChannelID);

    if(ChannelID == null){
        Spec_Message.channel.send("You are not in a channel")
        return 0
    }

    var InfoEmbed = new MessageEmbed()
        .addField("Now Playing", Spec_URL);

    Spec_Message.channel.send({embeds: [InfoEmbed]});

    var connection = joinVoiceChannel({
        channelId: ChannelID,
        guildId: Spec_Message.guild.id,
        adapterCreator: Channel.guild.voiceAdapterCreator
    })
    var Ended = false

    let Resource = createAudioResource(Stream);
    
    Player.play(Resource)
    connection.subscribe(Player)

    Player.on(AudioPlayerStatus.Idle, () => {
        connection.disconnect()
    })
    

}

client.on("messageCreate", async message => {
    if(message.content.startsWith(Prefix)){
        var MessageArgs = message.content.replace(Prefix, "").split(" ");

        if(MessageArgs[0] == "help"){
            var HelpEmbed = new MessageEmbed()
                .setColor("#FFFFFF")
                .addFields(
                    {name: ";play", value: "plays a song specified by your link"},
                    {name: ";skip", value: "starts voting if command not user is not Stonker, if yes, it will skips immediately"},
                    {name: ";disconnect", value: "disconnects from a voice channel"},
                    {name: ";pause", value: "pauses the song"}
                )
                .setFooter("Created by DneskaJeKrásně#4262")

            message.channel.send({embeds: [HelpEmbed]})
        }

        else if(MessageArgs[0] == "play" || MessageArgs[0] == "p") Play(client, MessageArgs[1], message)
        else if(MessageArgs[0] == "skip") Player.stop()
        else if(MessageArgs[0] == "pause"){
            if(PauseBool == true) Player.unpause(), PauseBool = false
            else if(PauseBool == false) Player.pause(), PauseBool = true
        }
        else if(MessageArgs[0] == "loop"){
            if(Loop == true) Loop = false
            else if(Loop == false) Loop = true


        }

        else if(MessageArgs[0] == "disconnect"){

            if(message.guild.me.voice.channel == null){
                message.channel.send("I am not in the channel!")
                return 0;
            }
            getVoiceConnection(message.guild.id).disconnect()
            message.channel.send("Gon")
                
        }

        else if(MessageArgs[0] == "leave"){
            if(message.author.id == AuthorID){
                message.channel.send("Gonning the server, have a nice day!")
                message.guild.leave()
            }
            else{
                message.channel.send("You are not the author!")
            }
        }
    }
})

client.once("ready", () => {
    console.log("Online!") 
    client.user.setActivity("trying to be cool")
})

client.login("FILL HERE THE ID")