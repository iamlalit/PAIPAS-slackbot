cd /home/ubuntu/PAIPAS/PAIPAS-slackbot/
forever stopall
forever start -o out1.log -e err1.log index.js
