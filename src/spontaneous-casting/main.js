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
  if (spells.length === 0) {
    return '<option>Aucun sort disponible</option>'
  }

  if (minSlotLevel == null) {
    minSlotLevel = 0
  }

  if (maxSlotLevel == null) {
    maxSlotLevel = 9
  }

  console.log(`Spontaneous Casting | Create Spell Options `, {
    selectedSpellbookLabel,
    spells,
    minSlotLevel,
    maxSlotLevel,
  })

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
  }

  element.innerHTML = value
}

const getHtmValue = (htm, selector) => {
  const element = htm.find(selector)?.[0]

  if (element == null) {
    console.error(`Could not find element "${selector}"`)
  }

  return element.value
}

const refreshSourceOptions = (htm, preparedSpells) => {
  const spellbookLabel = getHtmValue(htm, '#bookSelect')
  const slotLevel = parseFloat(getHtmValue(htm, '#slotSelect'))

  const preparedSpellsOptions = createSpellsOptions(
    spellbookLabel,
    preparedSpells,
    slotLevel,
    slotLevel,
  )
  editInnerHtml(htm, '#sourceSelect', preparedSpellsOptions)
}

const refreshCastOptions = (htm, preparedSpells, spontaneousSpells) => {
  const spellbookLabel = getHtmValue(htm, '#bookSelect')
  const spellSourceId = getHtmValue(htm, '#sourceSelect')

  const spellSource = preparedSpells.filter(({ id }) => id === spellSourceId)
  const { spellLevel: spellSourceLevel } = spellSource

  const preparedSpellsOptions = createSpellsOptions(
    spellbookLabel,
    spontaneousSpells,
    spellSourceLevel,
  )
  editInnerHtml(htm, '#castSelect', preparedSpellsOptions)
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

  const [{ label: spellbookLabel }] = compatibleSpellbooks

  const {
    items: { contents: actorItems },
    name: actorName,
  } = actor

  console.log('Spontaneous Casting | Actor Items obtained')

  const preparedSpells = getPreparedSpells(actorItems)
  const preparedSpellsOptions = createSpellsOptions(
    spellbookLabel,
    preparedSpells,
    1,
    1,
  )

  console.log('Spontaneous Casting | Actor Prepared Spells obtained')

  const spellSlots = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const spellSlotsOptions = createSpellSlotsOptions(spellSlots, preparedSpells)

  const spontaneousSpells = getSpontaneousSpells(actorItems)
  const spontaneousSpellsOptions = createSpellsOptions(
    spellbookLabel,
    spontaneousSpells,
  )

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
      <select id="slotSelect">${spellSlotsOptions}</select>
    </div>
    <div class="form-group">
      <label>Sort à consommer :</label>
      <select id="sourceSelect" style="min-width: 100%; max-width: 100%;">${preparedSpellsOptions}</select>
    </div>
    <div class="form-group">
      <label>Sort à lancer:</label>
      <select id="castSelect" style="min-width: 100%; max-width: 100%;">${spontaneousSpellsOptions}</select>
    </div>
  </form>
`

  // Display UI
  new Dialog({
    title: 'Incantation Spontannée',
    content: form,
    buttons: {
      use: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: 'Utilise cet emplacement de sort',
      },
    },
    render: (htm) => {
      htm
        .find('#bookSelect')
        .change(() => refreshSourceOptions(htm, preparedSpells))
      htm
        .find('#slotSelect')
        .change(() => refreshSourceOptions(htm, preparedSpells))
      htm
        .find('#castSelect')
        .change(() =>
          refreshCastOptions(htm, preparedSpells, spontaneousSpells),
        )
    },
  }).render(true)
}

// Get actors and open dialogue
const selectedTokens = canvas.tokens.controlled
openDialog(selectedTokens)
