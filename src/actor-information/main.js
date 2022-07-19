// CONFIGURATION
// Leave the actorNames array empty to guess the players
// Example actorNames: `actorNames: ["Bob", "John"],`
const c = {
  actorNames: [],
}
// END CONFIGURATION

const getTable = (header, rows) =>
  `
    <table>
      <thead>
        ${header}
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `

const renderChatMessage = (chatMessage) => {
  const chatMessageData = ChatMessage.applyRollMode(
    {
      content: chatMessage,
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ user: game.user }),
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    },
    game.settings.get('core', 'rollMode'),
  )
  ChatMessage.create(chatMessageData)
}

const getInitialMsg = (actors) => {
  if (actors.length === 1) {
    return `Quelle information voulez vous obtenir pour l'acteur suivant : <strong>${actors[0].name}</strong>`
  }

  return `Quelle information voulez vous obtenir pour les acteurs suivants : <strong>${actors
    .map((o) => o.name)
    .join('</strong>, <strong>')}</strong>`
}

const getDemoralizeTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Démoraliser (Intimidation)</td>
    <tr>
    <td>Acteur</td>
    <td>DD</td>
  `
  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const dc = 10 + rollData.attributes.hd.total + rollData.abilities.wis.mod

    return `<tr><td>${actor.name}</td><td>${dc}</td></tr>`
  })

  return getTable(header, rows)
}

const getTableSubRows = (dataArr) => {
  const dipRows = dataArr.map((e) => {
    return `
        <tr>
          <td>
            ${e.label}
          </td>
          <td>
            ${e.data}
          </td>
        </tr>
      `
  })

  return dipRows.join('')
}

const getDiplomacyTable = () => {
  const header = `
    <tr>
      <td colSpan="3">Diplomacie</td>
    <tr>
    <td>Acteur</td>
    <td>Attitude initial</td>
    <td>DD</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const dataArr = [
      { label: 'Hostile', data: 25 + rollData.abilities.cha.mod },
      { label: 'Inamical', data: 20 + rollData.abilities.cha.mod },
      { label: 'Indifférent', data: 15 + rollData.abilities.cha.mod},
      { label: 'Amical', data: 10 + rollData.abilities.cha.mod },
      { label: 'Serviable', data: 0 + rollData.abilities.cha.mod},
    ]

    const actorRow = `<td rowspan='8'>${actor.name}</td>`

    const dipRows = getTableSubRows(dataArr)

    return `
      <tr>${actorRow}</tr>
      <tr>${dipRows}</tr>
    `
  })

  return getTable(header, rows)
}

const getAcTable = () => {
  const header = `
    <tr>
      <td colSpan="3">Classe d'Armure</td>
    <tr>
    <td>Acteur</td>
    <td>Situation</td>
    <td>CA</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const dataArr = [
      { label: 'Base', data: rollData.attributes.ac.normal.total},
      { label: 'Attaque de Contact', data: rollData.attributes.ac.touch.total },
      { label: 'Pris au dépourvu', data: rollData.attributes.ac.flatFooted.total },
    ]

    const actorRow = `<td rowspan='5'>${actor.name}</td>`

    const acRows = getTableSubRows(dataArr)

    return `
      <tr>${actorRow}</tr>
      <tr>${acRows}</tr>
    `
  })

  return getTable(header, rows)
}

const getSocialDefenses = () => {
  const demoralizeTable = getDemoralizeTable()
  const diplomacyTable = getDiplomacyTable()

  const chatMessage = demoralizeTable + diplomacyTable

  renderChatMessage(chatMessage)
}

const getCombatDefenses = () => {
  const acTable = getAcTable()

  renderChatMessage(acTable)
}

const openDialog = (actors) => {
  const msg = getInitialMsg(actors)

  new Dialog({
    title: "Obtenir les informations d'acteurs",
    content: `<p>${msg}</p>`,
    buttons: {
      socialDefenses: {
        label: 'Défenses Sociales',
        callback: getSocialDefenses,
      },
      combatDefenses: {
        label: 'Défenses Combat',
        callback: getCombatDefenses,
      },
    },
  }).render(true)
}

const tokens = canvas.tokens.controlled
let actors = tokens.map((o) => o.actor)
if (!actors.length && c.actorNames.length)
  actors = game.actors.entities.filter((o) => c.actorNames.includes(o.name))
if (!actors.length)
  actors = game.actors.entities.filter(
    (o) => o.isPC && o.testUserPermission(game.user, 'OWNER'),
  )
actors = actors.filter((o) => o.testUserPermission(game.user, 'OWNER'))

if (!actors.length) {
  ui.notifications.warn('Aucun acteur compatible trouvé')
} else {
  openDialog(actors)
}
