const configuration = {
  compatibleClasses: ['druid', 'cleric', 'warpriest'],
}
/**
 * Get the currently prepared spells in the book, ordered highest level to lowest
 */
const getPreparedSpells = (actorItems) =>
  actorItems
    .filter(
      ({
        type,
        spellLevel,
        system: { atWill, preparation: { preparedAmount } = {} } = {},
      }) => type === 'spell' && !atWill && spellLevel > 0 && preparedAmount > 0,
    )
    .sort((a, b) => {
      return b.spellLevel - a.spellLevel
    })

/**
 * Get the spells that can be cast spontaneously in the book, ordered highest level to lowest
 */
const getSpontaneousSpells = (actorItems) =>
  actorItems
    .filter(({ type, system: { atWill } = {} }) => type === 'spell' && atWill)
    .sort((a, b) => b.spellLevel - a.spellLevel)

const getCompatibleSpellbooks = (actor) => {
  const {
    system: {
      attributes: { spells: { spellbooks } = {} },
    },
  } = actor

  const { compatibleClasses } = configuration

  // spells element can use a class ID as a key.
  return Object.values(spellbooks).filter(({ class: spellbookClass }) =>
    compatibleClasses.includes(spellbookClass),
  )
}

const createSpellbooksOptions = (spellbooks) => {
  if (spellbooks.length === 0) {
    return '<option>Aucun grimoire compatible disponible</option>'
  }

  console.log(`Spontaneous Casting | Create Books Options `, {
    spellbooks,
  })

  return spellbooks.map(
    ({ label }) => `<option value='${label}'>${label}</option>`,
  )
}

const createSpellsOptions = (
  selectedSpellbookLabel,
  spells,
  minSlotLevel,
  maxSlotLevel,
) => {
  console.log(`Spontaneous Casting | Create Spell Options `, {
    selectedSpellbookLabel,
    spells,
    minSlotLevel,
    maxSlotLevel,
  })

  if (spells.length === 0) {
    return '<option>Aucun sort disponible</option>'
  }

  if (minSlotLevel == null) {
    minSlotLevel = 0
  }

  if (maxSlotLevel == null) {
    maxSlotLevel = 9
  }

  return spells
    .filter(
      ({
        spellLevel,
        spellbook: { label: currentSpellbookLabel },
        system: {
          preparation: { preparedAmount },
        },
      }) =>
        currentSpellbookLabel === selectedSpellbookLabel &&
        preparedAmount > 0 &&
        spellLevel >= minSlotLevel &&
        spellLevel <= maxSlotLevel,
    )
    .map(
      ({
        id,
        name,
        system: {
          atWill,
          preparation: { preparedAmount, maxAmount },
        },
      }) => {
        const remainedUsageLabel = atWill
          ? ''
          : ` ${preparedAmount} / ${maxAmount}`
        return `<option value="${id}">${name}${remainedUsageLabel}</option>`
      },
    )
    .join('\n')
}

const createSpellSlotsOptions = (spellSlots, preparedSpells) => {
  if (spellSlots.length === 0) {
    return '<option>Aucun slot disponible</option>'
  }

  // Remove slots with no remaining spell
  console.log(preparedSpells)
  const usedSlots = preparedSpells.reduce((map, currentSpell) => {
    const {
      spellLevel,
      system: {
        preparation: { preparedAmount },
      },
    } = currentSpell
    const spellLevelKey = spellLevel.toString()
    if (preparedAmount > 0) {
      map[spellLevelKey] = 1
    }

    return map
  }, {})

  return spellSlots
    .filter((currentSlot) => usedSlots[currentSlot])
    .map((n) => `<option value="${n}"> Niveau ${n}</option>`)
}

const editInnerHtml = (htm, selector, value) => {
  const element = htm.find(selector)?.[0]

  if (element == null) {
    console.error(`Could not find element "${selector}"`)
    throw new Error()
  }

  element.innerHTML = value
}

const getHtmValue = (htm, selector) => {
  const element = htm.find(selector)?.[0]

  if (element == null) {
    console.error(`Could not find element "${selector}"`)
    throw new Error()
  }

  return element.value
}

const refreshCastOptions = (htm, preparedSpells, spontaneousSpells) => {
  const spellbookLabel = getHtmValue(htm, '#bookSelect')
  const spellSourceId = getHtmValue(htm, '#sourceSelect')

  const spellSource = preparedSpells.find(({ id }) => id === spellSourceId)
  if (spellSource == null) {
    console.error('Spontaneous Casting | Spell source not found')
    throw new Error()
  }

  console.info('Spontaneous Casting | Spell source found ', spellSource)

  const { spellLevel: spellSourceLevel } = spellSource

  const preparedSpellsOptions = createSpellsOptions(
    spellbookLabel,
    spontaneousSpells,
    1,
    spellSourceLevel,
  )
  editInnerHtml(htm, '#castSelect', preparedSpellsOptions)
}

const refreshSourceOptions = (htm, preparedSpells, spontaneousSpells) => {
  const spellbookLabel = getHtmValue(htm, '#bookSelect')
  const slotLevel = parseFloat(getHtmValue(htm, '#slotSelect'))

  const preparedSpellsOptions = createSpellsOptions(
    spellbookLabel,
    preparedSpells,
    slotLevel,
    slotLevel,
  )
  editInnerHtml(htm, '#sourceSelect', preparedSpellsOptions)

  refreshCastOptions(htm, preparedSpells, spontaneousSpells)
}

const refreshSlotOptions = (
  htm,
  spellSlots,
  preparedSpells,
  spontaneousSpells,
) => {
  const spellSlotsOptions = createSpellSlotsOptions(spellSlots, preparedSpells)

  editInnerHtml(htm, '#slotSelect', spellSlotsOptions)

  refreshSourceOptions(htm, preparedSpells, spontaneousSpells)
}

const useSpell = (
  htm,
  actor,
  spellSlots,
  preparedSpells,
  spontaneousSpells,
) => {
  const spellToUseId = getHtmValue(htm, '#sourceSelect')
  const spellToCastId = getHtmValue(htm, '#castSelect')

  const spellToUse = preparedSpells.find(({ id }) => id === spellToUseId)
  if (spellToUse == null) {
    console.error('Spontaneous Casting | Spell to use not found')
    throw new Error()
  }

  const { name: actorName } = actor

  const {
    name: spellToUseName,
    spellLevel: spellToUseLevel,
    system: {
      preparation: { preparedAmount: spellToUsePreparedAmount },
    },
  } = spellToUse

  if (spellToUsePreparedAmount === 0) {
    ui.notifications.error(`Le sort ${spellToUseName} n'a plus d'utilisation`)
    return
  }

  const spellToCast = spontaneousSpells.find(({ id }) => id === spellToCastId)
  if (spellToCast == null) {
    console.error('Spontaneous Casting | Spell to cast not found')
    throw new Error()
  }

  const { name: spellToCastName } = spellToCast

  actor.items.get(spellToUseId).update({
    'data.preparation.preparedAmount': spellToUsePreparedAmount - 1,
  })
  spellToCast.use()

  const msg = `
    <div class="pf1 chat-card">
      <header class="card-header flexrow">
        <h3 class="actor-name">Incantation Spontanée</h3>
      </header>
      <div class="result-text">
        <p>${actorName} consomme le sort ${spellToUseName} (niveau ${spellToUseLevel}) pour lancer le sort ${spellToCastName}.</p>
      </div>
    </div>
  `

  ChatMessage.create({
    content: msg,
  })

  refreshSlotOptions(htm, spellSlots, preparedSpells, spontaneousSpells)
}

const openDialog = (selectedTokens) => {
  if (!selectedTokens.length) {
    ui.notifications.warn('Aucun token selectionné')
    return
  }
  if (selectedTokens.length > 1) {
    ui.notifications.warn('Un seul token doit être selectionné')
    return
  }

  const { actor } = selectedTokens[0]

  const compatibleSpellbooks = getCompatibleSpellbooks(actor)
  if (compatibleSpellbooks.length === 0) {
    ui.notifications.warn(`${actor.name} n'a aucun grimoire compatible`)
    return
  }

  const bookOptions = createSpellbooksOptions(compatibleSpellbooks)

  const {
    items: { contents: actorItems },
    name: actorName,
  } = actor

  console.log('Spontaneous Casting | Actor Items obtained')

  const preparedSpells = getPreparedSpells(actorItems)

  console.log('Spontaneous Casting | Actor Prepared Spells obtained')

  const spellSlots = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  const spontaneousSpells = getSpontaneousSpells(actorItems)

  console.log('Spontaneous Casting | Actor Spontaneous Spells obtained')

  const form = `
    <form class="flexcol">
      <div class="form-group">
        <label>Personnage :</label>
        <p>${actorName}</p>
      </div>
      <div class="form-group">
        <label>Grimoire :</label>
        <select id="bookSelect" style="text-transform: capitalize">${bookOptions}</select>
      </div>
      <div class="form-group">
        <label>Niveau sort :</label>
        <select id="slotSelect"></select>
      </div>
      <div class="form-group">
        <label>Sort à consommer :</label>
        <select id="sourceSelect" style="min-width: 100%; max-width: 100%;"></select>
      </div>
      <div class="form-group">
        <label>Sort à lancer:</label>
        <select id="castSelect" style="min-width: 100%; max-width: 100%;"></select>
      </div>
    </form>
  `

  // Display UI
  new Dialog({
    title: 'Incantation Spontanée',
    content: form,
    buttons: {
      use: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: 'Utiliser cet emplacement de sort',
        callback: (htm) =>
          useSpell(htm, actor, spellSlots, preparedSpells, spontaneousSpells),
      },
    },
    render: (htm) => {
      htm
        .find('#bookSelect')
        .change(() =>
          refreshSourceOptions(htm, preparedSpells, spontaneousSpells),
        )
      htm
        .find('#slotSelect')
        .change(() =>
          refreshSourceOptions(htm, preparedSpells, spontaneousSpells),
        )
      htm
        .find('#castSelect')
        .change(() =>
          refreshCastOptions(htm, preparedSpells, spontaneousSpells),
        )

      refreshSlotOptions(htm, spellSlots, preparedSpells, spontaneousSpells)
    },
  }).render(true)
}

// Get actors and open dialogue
try {
  const selectedTokens = canvas.tokens.controlled
  openDialog(selectedTokens)
} catch (e) {
  ui.notifications.error("Erreur, voir la console pour plus d'information")
  console.error(e)
}
