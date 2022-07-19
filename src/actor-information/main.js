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
    return `<a>Acteur selectionné : <strong>${actors[0].name}</strong>`
  }

  return `<a>Acteurs selectionnés : <strong>${actors
    .map((o) => o.name)
    .join('</strong>, <strong>')}</strong></a>`
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

    return `
      <tr>
        <td>${actor.name}</td>
        <td>${dc}</td>
      </tr>`
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

  return getTable(header, rows.join(''))
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

  return getTable(header, rows.join(''))
}

const getCmdTable = () => {
  const header = `
    <tr>
      <td colSpan="3">Degré de Manœuvre Défensive</td>
    <tr>
    <td>Acteur</td>
    <td>Situation</td>
    <td>CMD</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const dataArr = [
      { label: 'Base', data: rollData.attributes.cmd.total},
      { label: 'Pris au dépourvu', data: rollData.attributes.cmd.flatFootedTotal },
    ]

    const actorRow = `<td rowspan='5'>${actor.name}</td>`

    const dmdRows = getTableSubRows(dataArr)

    return `
      <tr>${actorRow}</tr>
      <tr>${dmdRows}</tr>
    `
  })

  return getTable(header, rows.join(''))
}

const getFeintTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Feinter en combat</td>
    <tr>
    <td>Acteur</td>
    <td>DD</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const babDc = 10 + rollData.attributes.bab.total + rollData.abilities.wis.mod
    const senseMotiveDc = 10 + rollData.skills.sen.mod
    const senseMotiveTrained = rollData.skills.sen.rank > 0

    let dc
    if (senseMotiveDc > babDc && senseMotiveTrained) {
      dc = senseMotiveDc
    }
    else {
      dc = babDc
    }

    return `
      <tr>
        <td>${actor.name}</td>
        <td>${dc}</td>
      </tr>`
  })

  return getTable(header, rows.join(''))
}

const getSrTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Resistance à la Magie</td>
    <tr>
    <td>Acteur</td>
    <td>RM</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const sr = rollData.attributes.sr.total
    const hasSr = sr > 0

    return `
      <tr>
        <td>${actor.name}</td>
        <td>${hasSr ? sr : 'Aucune'}</td>
      </tr>`
  })

  return getTable(header, rows.join(''))
}

const getSocialDefenses = () => {
  const demoralizeTable = getDemoralizeTable()
  const diplomacyTable = getDiplomacyTable()

  return demoralizeTable + diplomacyTable
}

const getCombatDefenses = () => {
  const acTable = getAcTable()
  const dmdTable = getCmdTable()
  const feintTable = getFeintTable()
  const srTable = getSrTable()

  return acTable + dmdTable + feintTable + srTable
}

const renderSocialDefenses = () => {
  const chatMessage = getSocialDefenses()

  renderChatMessage(chatMessage)
}

const renderCombatDefenses = () => {
  const chatMessage = getCombatDefenses()

  renderChatMessage(chatMessage)
}

const renderAll = () => {
  const socialDefenses = getSocialDefenses()
  const combatDefenses = getCombatDefenses()

  const chatMessage = socialDefenses + combatDefenses

  renderChatMessage(chatMessage)
}

const openDialog = (actors) => {
  new Dialog({
    title: "Obtenir les informations d'acteurs",
    content: getInitialMsg(actors),
    buttons: {
      socialDefenses: {
        label: 'Défenses Sociales',
        callback: renderSocialDefenses,
      },
      combatDefenses: {
        label: 'Défenses Combat',
        callback: renderCombatDefenses,
      },
      all: {
        label: 'Tout',
        callback: renderAll,
      }
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
