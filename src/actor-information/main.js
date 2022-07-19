// CONFIGURATION
// Leave the actorNames array empty to guess the players
// Example actorNames: `actorNames: ["Bob", "John"],`
const c = {
  actorNames: [],
}
const cellStyle = 'min-width: 100px'
// END CONFIGURATION

const getTable = (header, rows) =>
  `
    <table>
      <thead>
        ${header}
      </thead>
      <tbody>
        ${rows.join('')}
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
    <td style='${cellStyle}'>Acteur</td>
    <td style='${cellStyle}'>DD</td>
  `
  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const dc = 10 + rollData.attributes.hd.total + rollData.abilities.wis.mod

    return `
      <tr>
        <td style='${cellStyle}'>${actor.name}</td>
        <td style='${cellStyle}'>${dc}</td>
      </tr>`
  })

  return getTable(header, rows)
}

const getTableSubRows = (dataArr) => {
  const dipRows = dataArr.map((e) => {
    return `
        <tr>
          <td style='${cellStyle}'>
            ${e.label}
          </td>
          <td style='${cellStyle}'>
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
    <td style='${cellStyle}'>Acteur</td>
    <td style='${cellStyle}'>Attitude initial</td>
    <td style='${cellStyle}'>DD</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const dataArr = [
      { label: 'Hostile', data: 25 + rollData.abilities.cha.mod },
      { label: 'Inamical', data: 20 + rollData.abilities.cha.mod },
      { label: 'Indifférent', data: 15 + rollData.abilities.cha.mod },
      { label: 'Amical', data: 10 + rollData.abilities.cha.mod },
      { label: 'Serviable', data: 0 + rollData.abilities.cha.mod },
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
    <td style='${cellStyle}'>Acteur</td>
    <td style='${cellStyle}'>Situation</td>
    <td style='${cellStyle}'>CA</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const dataArr = [
      { label: 'Base', data: rollData.attributes.ac.normal.total },
      { label: 'Attaque de Contact', data: rollData.attributes.ac.touch.total },
      {
        label: 'Pris au dépourvu',
        data: rollData.attributes.ac.flatFooted.total,
      },
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

const getCmdTable = () => {
  const header = `
    <tr>
      <td colSpan="3">Degré de Manœuvre Défensive</td>
    <tr>
    <td style='${cellStyle}'>Acteur</td>
    <td style='${cellStyle}'>Situation</td>
    <td style='${cellStyle}'>CMD</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const dataArr = [
      { label: 'Base', data: rollData.attributes.cmd.total },
      {
        label: 'Pris au dépourvu',
        data: rollData.attributes.cmd.flatFootedTotal,
      },
    ]

    const actorRow = `<td rowspan='5'>${actor.name}</td>`

    const dmdRows = getTableSubRows(dataArr)

    return `
      <tr>${actorRow}</tr>
      <tr>${dmdRows}</tr>
    `
  })

  return getTable(header, rows)
}

const getFeintTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Feinter en combat (Bluff)</td>
    <tr>
    <td style='${cellStyle}'>Acteur</td>
    <td style='${cellStyle}'>DD</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const babDc =
      10 + rollData.attributes.bab.total + rollData.abilities.wis.mod
    const senseMotiveDc = 10 + rollData.skills.sen.mod
    const senseMotiveTrained = rollData.skills.sen.rank > 0

    let dc
    if (senseMotiveDc > babDc && senseMotiveTrained) {
      dc = senseMotiveDc
    } else {
      dc = babDc
    }

    return `
      <tr>
        <td style='${cellStyle}'>${actor.name}</td>
        <td style='${cellStyle}'>${dc}</td>
      </tr>`
  })

  return getTable(header, rows)
}

const getEnergyResistanceTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Resistance aux énérgies</td>
    <tr>
    <td style='${cellStyle}'>Acteur</td>
    <td style='${cellStyle}'>Resistances</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const resistances = rollData.traits.eres

    return `
      <tr>
        <td style='${cellStyle}'>${actor.name}</td>
        <td style='${cellStyle}'>${resistances}</td>
      </tr>`
  })

  return getTable(header, rows)
}

const getResistanceTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Resistances</td>
    <tr>
    <td style='${cellStyle}'>Acteur</td>
    <td style='${cellStyle}'>Resistances</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const resistances = rollData.traits.cres

    return `
      <tr>
        <td style='${cellStyle}'>${actor.name}</td>
        <td style='${cellStyle}'>${resistances}</td>
      </tr>`
  })

  return getTable(header, rows)
}

const getSrTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Resistance à la Magie</td>
    <tr>
    <td style='${cellStyle}'>Acteur</td>
    <td style='${cellStyle}'>RM</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const sr = rollData.attributes.sr.total
    const hasSr = sr > 0

    return `
      <tr>
        <td style='${cellStyle}'>${actor.name}</td>
        <td style='${cellStyle}'>${hasSr ? sr : 'Aucune'}</td>
      </tr>
    `
  })

  return getTable(header, rows)
}

const getDamageImmunitiesTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Immunités aux dommages</td>
    <tr>
    <td style='min-width: 100px'>Acteur</td>
    <td style='${cellStyle}'>Resistances</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const damageImmunity = rollData.traits.di.value.map(translate)
    const damageImmunityCustom = rollData.traits.di.custom
    if (damageImmunityCustom) {
      damageImmunity.push(damageImmunityCustom)
    }

    const hasDamageImmunity = damageImmunity.length > 0

    return `
      <tr>
        <td style='${cellStyle}'>${actor.name}</td>
        <td style='${cellStyle}'>${
      hasDamageImmunity ? damageImmunity.join(', ') : 'Aucun'
    }</td>
      </tr>`
  })

  return getTable(header, rows)
}

const getImmunitiesTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Immunités</td>
    <tr>
    <td style='min-width: 100px'>Acteur</td>
    <td style='${cellStyle}'>Resistances</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const immunity = rollData.traits.ci.value.map(translate)
    const immunityCustom = rollData.traits.ci.custom
    if (immunityCustom) {
      immunity.push(immunityCustom)
    }

    const hasImmunity = immunity.length > 0

    return `
      <tr>
        <td style='${cellStyle}'>${actor.name}</td>
        <td style='${cellStyle}'>${
      hasImmunity ? immunity.join(', ') : 'Aucun'
    }</td>
      </tr>`
  })

  return getTable(header, rows)
}

const getDamageVulnerabilitiesTable = () => {
  const header = `
    <tr>
      <td colSpan="2">Vulnérabilités aux dommages</td>
    <tr>
    <td style='min-width: 100px'>Acteur</td>
    <td style='${cellStyle}'>Vulnérabilités</td>
  `

  const rows = actors.map((actor) => {
    const rollData = actor.getRollData({ forceRefresh: false })
    const damageVulnerabilities = rollData.traits.dv.value.map(translate)
    const damageVulnerabilitiesCustom = rollData.traits.dv.custom
    if (damageVulnerabilitiesCustom) {
      damageVulnerabilities.push(damageVulnerabilitiesCustom)
    }

    const hasDamageVulnerabilities = damageVulnerabilities.length > 0

    return `
      <tr>
        <td style='${cellStyle}'>${actor.name}</td>
        <td style='${cellStyle}'>${
      hasDamageVulnerabilities ? damageVulnerabilities.join(', ') : 'Aucune'
    }</td>
      </tr>`
  })

  return getTable(header, rows)
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
  const energyResistanceTable = getEnergyResistanceTable()
  const resistanceTable = getResistanceTable()
  const damageImmunities = getDamageImmunitiesTable()
  const immunities = getImmunitiesTable()
  const damageVulnerabilities = getDamageVulnerabilitiesTable()

  return (
    acTable +
    dmdTable +
    feintTable +
    srTable +
    energyResistanceTable +
    resistanceTable +
    damageImmunities +
    immunities +
    damageVulnerabilities
  )
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
  const resistances = getResistances()
  const immunities = getImmunities()
  const vulnerabilities = getVulnerabilities()

  const chatMessage =
    socialDefenses + combatDefenses + resistances + immunities + vulnerabilities

  renderChatMessage(chatMessage)
}

const translate = (e) => {
  const translationMap = {
    untyped: 'Non Typé',
    slashing: 'Tranchant',
    piercing: 'Perçant',
    bludgeoning: 'Contondant',
    fire: 'Feu',
    electric: 'Electricité',
    cold: 'Froid',
    acid: 'Acid',
    sonic: 'Sonique',
    force: 'Force',
    negative: 'Énergie Négative',
    positive: 'Énergie Postive',
    precision: 'Précision',
    nonlethal: 'Non Léthal',
    energyDrain: "Absortion d'Énergy",
    fear: 'Apeuré(e)',
    blind: 'Aveuglé(e)',
    confuse: 'Confus(e)',
    deathEffects: 'Effets de Mort',
    dazzle: 'Ébloui(e)',
    mindAffecting: 'Effects Mentaux',
    stun: 'Étourdi(e)',
    fatigue: 'Fatigué(e)',
    sicken: 'Fiévreux(se)',
    daze: 'Hébété(e)',
    disease: 'Maladie',
    paralyze: 'Paralysé(e)',
    petrify: 'Pétrifié(e)',
    poison: 'Poison',
    bleed: 'Saignement',
    sleep: 'Sommeil',
    deaf: 'Sourd(e)',
  }

  return translationMap[e] || e
}

const openDialog = (actors) => {
  new Dialog({
    title: "Obtenir les informations d'acteurs",
    content: getInitialMsg(actors),
    buttons: {
      socialDefenses: {
        label: 'Social',
        callback: renderSocialDefenses,
      },
      combatDefenses: {
        label: 'Combat',
        callback: renderCombatDefenses,
      },
      all: {
        label: 'Tout',
        callback: renderAll,
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
