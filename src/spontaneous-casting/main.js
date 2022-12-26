/**
 * Provides simple menu for replacing a prepared spell slot with a casting of a class' spontaneous replacement spell (e.g. Cure spells for good Clerics).
 *
 * Caster must have a spellbook with prepared spells and the spontaneous replacement must be set as an at-will spell.
 **/

// CONFIGURATION
// Leave the actorNames array empty to guess the players
// Example actorNames: `actorNames: ["Bob", "John"],
// Fill in allowed prepared caster classes that spontaneous replace in lower case below
const c = {
  actorNames: [],
  spontClasses: ['druid', 'cleric', 'warpriest', 'matreDesForgesNain'],
  spellbooks: {
    ' (matreDesForgesNain-primary)': 'Maître des Forges',
  },
}
// END CONFIGURATION

const openDialog = (actors) => {
  if (!actors.length) {
    ui.notifications.warn('Aucun acteur compatible trouvé')
    return
  }
  if (actors.length > 1) {
    ui.notifications.warn('Un seul acteur doit être selectionné')
    return
  }

  // Check for spellbooks
  const activeBooks = actor.data.data.attributes.spells.usedSpellbooks
  if (!activeBooks.length) {
    ui.notifications.warn(`${actor.data.name} n'a aucun grimoire disponible`)
    return
  }

  // Get spellbook info
  const spellbooks = []
  activeBooks.forEach((o) => {
    const book = actor.data.data.attributes.spells.spellbooks[o]
    if (c.spontClasses.includes(book.class)) spellbooks.push([o, book])
  })

  // Build spellbook options
  console.log('spellbooks ', spellbooks)
  let bookOptions = spellbooks.map(
    (o, index) => `<option value="${o.name}">${o[1].label}</option>`,
  )
  if (!bookOptions.length) {
    ui.notifications.warn(
      "Aucun grimoire n'est compatible incantation spontannée ",
    )
    return
  }
  // Build prepared slot and spontaneous replacement options
  console.log(`spontaneous-casting | ${spellbooks[0]}`)
  let slotOptions = populatePrepared(null, spellbooks[0][0])
  if (!slotOptions[1].length) {
    ui.notifications.warn(`${actor.data.name} n\'a aucun sort preparé`)
    return
  }

  const slotSpellID = slotOptions[1].length > 0 ? slotOptions[1][0].id : null
  const castOptions = populateSpontaneous(null, slotSpellID)
  const form = `
  <form class="flexcol">
    <div class="form-group">
      <label>Personnage :</label>
      <p>${actor.name}</p>
    </div>
    <div class="form-group">
      <label>Grimoire :</label>
      <select id="classSelect" style="text-transform: capitalize">${bookOptions}</select>
    </div>
    <div class="form-group">
      <label>Emplacement :</label>
      <select id="slotSelect">${slotOptions[0]}</select>
    </div>
    <div class="form-group">
      <label>Sort à lancer:</label>
      <select id="castSelect">${castOptions}</select>
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
        callback: useSpell,
      },
    },
    render: (htm) => {
      htm.find('#classSelect').change(populatePrepared.bind(this, htm, null))
      htm.find('#slotSelect').change(populateSpontaneous.bind(this, htm, null))
    },
  }).render(true)
}

/**
 * Removes one use of the prepared spell and casts the spontaneous spell
 * Outputs a chat card of the used and replacement spells
 **/
function useSpell(htm, event) {
  // Get the info about the spells
  const usedSlotID = htm.find('#slotSelect')[0].value
  const spontSpellID = htm.find('#castSelect')[0].value
  const usedSpell = actor.items.find((o) => o.id === usedSlotID)
  const spontSpell = actor.items.find((o) => o.id === spontSpellID)

  // Update used spell preparations
  const newUses = usedSpell.data.data.preparation.preparedAmount - 1
  actor.items.get(usedSlotID).update({
    'data.preparation.preparedAmount': newUses,
  })

  // Build chat card and display
  let msg = `<div class="pf1 chat-card">
                    <header class="card-header flexrow">
                        <h3 class="actor-name">Incantation spontanée</h3>
                    </header>
                    <div class="result-text">
                        <p>${actor.name} perd une utilisation de sort ${usedSpell.data.name} (niveau ${usedSpell.data.data.level}) pour lancer ${spontSpell.name}.</p>
                    </div>
                </div>`

  ChatMessage.create({
    content: msg,
  })

  spontSpell.use()
}

/**
 * Populates the prepared options select element with options
 *
 **/
const populatePrepared = (htm, spellBook) => {
  // Either get the spellbook info from the form or from the passed name
  let selectedBook = !spellBook ? htm.find('#classSelect')[0].value : spellBook

  // Get the currently prepared spells in the book, ordered highest level to lowest
  let availableSpells = actor.data.items
    .filter(
      (o) =>
        o.type === 'spell' &&
        o.data.data.level > 0 &&
        !o.data.data.atWill &&
        o.data.data.preparation.preparedAmount > 0 &&
        o.data.data.spellbook === selectedBook.toLowerCase(),
    )
    .sort(function (a, b) {
      return b.data.data.level - a.data.data.level
    })

  // Build the options, if any
  let slotOptions = ''
  if (availableSpells.length) {
    slotOptions = availableSpells.map(
      (o) =>
        `<option value="${o.id}">${o.name} (Nv ${o.data.data.level}, ${o.data.data.preparation.preparedAmount} dispo)</option>`,
    )
  } else slotOptions = '<option>Aucun sort préparé disponible</option>'

  // If called from the form, update the form
  if (htm) {
    htm.find('#slotSelect')[0].innerHTML = slotOptions
    if (availableSpells.length) populateSpontaneous(htm, availableSpells[0]._id)
    else populateSpontaneous(htm, null)
  }

  // For initial form building
  return [slotOptions, availableSpells]
}

/**
 * Populates the spontaneous replacement options select element
 **/
function populateSpontaneous(htm, spellSlotID, event = null) {
  // Get info about the prepared spell
  const selectedSpellID = !spellSlotID
    ? htm.find('#slotSelect')[0].value
    : spellSlotID
  const selectedSpell = actor.data.items.find((o) => o.id === selectedSpellID)
  const slotLevel = selectedSpell?.data.data.level

  // Find at-will spells of the same level or lower to spontaneous cast
  const spontSpells = actor.data.items
    .filter(
      (o) =>
        o.type === 'spell' &&
        o.data.data.level <= slotLevel &&
        o.data.data.atWill &&
        o.data.data.spellbook ===
          selectedSpell.data.data.spellbook.toLowerCase(),
    )
    .sort(function (a, b) {
      return b.data.data.level - a.data.data.level
    })

  // Build the options if any
  let spontOptions = ''
  if (spontSpells.length) {
    spontOptions = spontSpells.map(
      (o) =>
        `<option value="${o.id}">${o.name} (lv ${o.data.data.level})</option>`,
    )
  } else spontOptions = '<option>Aucun sort sans emplacement</option>'

  // If called from the form, update the form
  if (htm) {
    htm.find('#castSelect')[0].innerHTML = spontOptions

    // If no options available, disable the use button
    htm.find('button')[0].disabled = !spontSpells.length
  }

  // For initial form building
  return spontOptions
}

// Get actors
const actors = canvas.tokens.controlled
openDialog(actors)
