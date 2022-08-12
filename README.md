# foundryvtt-scripts

A list of random scripts for [Foundry VTT](https://foundryvtt.com/) in Javascript to make my life easier when I play as a Game Master, feel free to use them.

Currently, only French is supported.

# A hopefully updated list of scripts

## Actor information

Give information related to selected actors. Information can be about social or fighting skills.

## Converter

Convert most commonly used measurements in the imperial and metric systems.

Available conversion :

- Meters to feet
- Feet to Meters
- Kilograms to Pounds
- Pounds to Kilograms

The result is whispered to the user, meaning only they can see it.

Note: the conversion is based on DnD / Pathfinder logic, not the real world. 1.5 meter is 5 feet and 1 kilogram is 2 pounds.

## Spontaneous Casting

Implement Spontaneous Casting rules for compatible class.

Note: currently only available for good spell caster. Will not work with non french spells.

Credit: based on Discord user websterguy#1136 script

## Weight Modifier

~~Currently, there is a bug in Foundry system Pathfinder 1e preventing any item weight modification, this macro can solve this problem.~~

Edit: has been fixed, kept for archiving purpose.

To use this macro, a token linked to an actor must be selected.

Credit: based on Discord user websterguy#1136 script

# How to use

1. Create a Foundry VTT [script macro](https://foundryvtt.com/article/macros/).
2. Copy the code in the `src/{script name}/main.js` directory and past it in Foundry.
3. Enjoy.
