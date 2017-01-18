# mrtbot  
  
A silly 3 hour hack one night in Oman made this.  
  
To use:  
0) create a bot by going to: https://_yourorganization_.slack.com/services/new/bot   
1) create a custom emoji by going to: https://_yourorganization_.slack.com/customize/emoji  
2) call it mrt and upload _emoji\mrt.png_  
3) give it a cool customized name like _mr.t_ 
4) click save integration  
5) copy the API Token  
6) edit bin\bot.js and replace _bot_token_here_ with the API token. DO NOT COMMIT YOUR TOKEN TO SOURCE CONTROL!  
7) init the joke db by running: _node data\databaseInit.js_  
8) go to a channel and invite your bot to it: _/invite @mr.t_  
9) edit bin\bot.js and replace _chat_channel_here_ with the channel @mr.t just joined without the leading #. E.g mrt_test_channel  
10) run the bot: _node bin\bot.js_  
11) laugh  
