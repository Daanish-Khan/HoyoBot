# HoyoBot
A Discord Bot for Honkai Star Rail that performs daily check-ins as well as code redemption for every user registered in the bot.

## Usage

[invite link](https://discord.com/api/oauth2/authorize?client_id=1152654501745008691&permissions=2147830848&scope=applications.commands%20bot)

`/setchannel` (ADMIN ONLY) sets the channel you want hoyobot to send notifs in

`/register [email] [password]` logs you in. You must verify yourself with the captcha provided by the bot. (user pass only persisted until registration is complete, and then it is deleted from the db. Code is open source if you want to look through it yourself)

`/checkin` checks you in for the day (only to be used when the bot messes up or when you first register)

Thats it! The bot will checkin for you everyday at 1am. Enjoy your free rewards!
