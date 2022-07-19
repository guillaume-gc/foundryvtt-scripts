// CONFIGURATION
// Leave the actorNames array empty to guess the players
// Example actorNames: `actorNames: ["Bob", "John"],`
const c = {
  actorNames: [],
}
// END CONFIGURATION

const getInitialMsg = (actors) => {
  if (actors.length === 1) {
    return `<a>Acteur selectionné : <strong>${actors[0].name}</strong>`
  }

  return `<a>Acteurs selectionnés : <strong>${actors
    .map((o) => o.name)
    .join('</strong>, <strong>')}</strong></a>`
}

const roll = async (type) => {
  for (let a = 0; a < actors.length; a++) {
    const o = actors[a]
    await o.rollSavingThrow(type, {
      event: new MouseEvent({}),
      noSound: a > 0,
    })
  }
}

const openDialog = (actors) => {
  new Dialog({
    title: 'Jet de sauvegarde',
    content: getInitialMsg(actors),
    buttons: {
      fort: {
        label: 'Vigueur',
        callback: () => roll('fort'),
      },
      ref: {
        label: 'Réflexe',
        callback: () => roll('ref'),
      },
      will: {
        label: 'Volonté',
        callback: () => roll('will'),
      },
    },
  }).render(true)
}

const tokens = canvas.tokens.controlled
let actors = tokens.map((o) => o.actor)
if (!actors.length && c.actorNames.length)
  actors = game.actors.filter((o) => c.actorNames.includes(o.name))
if (!actors.length)
  actors = game.actors.filter(
    (o) => o.isPC && o.testUserPermission(game.user, 'OWNER'),
  )
actors = actors.filter((o) => o.testUserPermission(game.user, 'OWNER'))

if (!actors.length) {
  ui.notifications.warn('Aucun acteur compatible trouvé')
} else {
  openDialog(actors)
}
