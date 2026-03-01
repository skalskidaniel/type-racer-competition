# Project overview

## Step 1

I have identified the best would be to use socket.io for the real-time competition.

I will create a local hosted app.

### Usage scenarios

**Creating the tournament**

1. First user visits the page and is presented with a form to create a new tournament; he is treated as admin as he is the first user
2. The user chooses the tournament rules

   a. Time per round (default 60 seconds)

   b. Break time between rounds (default 15 seconds)

   c. Number of rounds (default 5)

**Joining the tournament**

1. User visits the site and enters their name
2. User can see the players who already joined the competition
3. User waits for admin's signal to start the game

**Tournament rules**

1. Each round every user gets the same one sentence
2. Round text is generated to be up to 100 characters
3. Tracked metrics include words per minute (words with errors doesn't count) and accuracy
4. The round finishes after each competitor finished typing or after a deadline set by the admin
5. There is a counter signaling time left in the round

## Step 2

Used LLM to generate CSS styling.