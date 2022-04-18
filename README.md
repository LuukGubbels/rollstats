# rollstats

```rollstats``` is a module for FoundryVTT. It is used to keep track of the d20 rolls made by players (and GM's!).
During a session and throughout a lifetime, this module will keep track of the following per player/character:
  - Number of dice rolled
  - Outcome of the dice rolled
  - Saving the kind of rolls (e.g. perception checks, attack rolls, etc.) and visualize these results in a pie graph per player.

These rolls will then be used to determine statistics such as:
  - Average rolled
  - Deviation from the actual mean (10.5 for d20's)
  - Number of natural 1's and natural 20's
  - How lucky a player is based on the devation from the actual mean

## Supported gamesystems
  Currently, this module supports the following gamesystems:
  - Dungeons and Dragons: Fifth Edition (DnD5e)
  - Pathfinder: Second Edition (PF2e)

While rollstats might work for other gamesystems as well, we only checked these gamesystems. So we know it works for sure. 
 
## Options 
GM's can change the following settings:
  - Who is able to see the statistics of who. Options consist of:
    - "none": Players can not see any statistics
    - "own": Players can only see their own statistics
    - "all": Players can see everyone's statistics (including the GM's)
    Note that GM's can always see everyone's statistics.
    Defaults to "none".
  - If rolls are stored per player, per character, both or none. Options consist of:
    - "none": No rolls are stored
    - "players": Rolls are stored per player
    - "characters": Rolls are stored per character
    - "both": Rolls are stored for both players and characters
    Note that the GM's rolls are always stored for the GM and never for the characters/monsters they roll for.
    Also note that, while in many instances "players" and "characters" result in the same outcome, in some instances they do not (using pet characters or character death).
    Defaults to "players".

## Future Features
These features will be added in the future:
- Export function (.csv)

## Known issues
If homebrew items are used, that deal 1d20 damage, ```rollstats``` will think of this as a normal d20 rolls (for skill checks, initiative etc.).
