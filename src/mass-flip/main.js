const knownActorGroups = {
  // Cheval Léger
  'Cheval%20L%C3%A9ger': {
    images: {
      idle: {
        name: 'Immobile',
        url: 'horse-*-plain-idle.webm',
      },
      walk: {
        name: 'Marcher',
        url: 'horse-*-plain-walk.webm',
      },
      run: {
        name: 'Galoper',
        url: 'horse-*-plain-gallop.webm',
      },
    },
  },
}

const openDialog = (canvas, currentActorGroups) => {
  const form = createForm(currentActorGroups)

  new Dialog({
    title: 'Mass flip',
    content: form,
    buttons: {
      use: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: 'Confirmer le flip',
        callback: (htm) => flipTokens(htm, canvas, currentActorGroups),
      },
    },
    render: (htm) => {
      htm
        .find('#actorGroup')
        .change(() =>
          refreshImageOptions(htm),
        )

      refreshImageOptions(htm)
    },
  }).render(true)
}

const flipTokens = (htm, canvas, currentActorGroups) => {
  const actorGroupsLabel = getHtmValue(htm, '#mass-flip-current-actor-groups')
}

const getHtmValue = (htm, selector) => {
  const element = htm.find(selector)?.[0]

  if (element == null) {
    throw new Error(`Could not find element "${selector}"`)
  }

  return element.value
}

const editInnerHtml = (htm, selector, value) => {
  const element = htm.find(selector)?.[0]

  if (element == null) {
    console.error(`Could not find element "${selector}"`)
    throw new Error()
  }

  element.innerHTML = value
}

const createForm = (currentActorGroups) => `
    <form class="flexcol">
      <div class="form-group">
        <label>Groupe d'acteur :</label>
        <select id="mass-flip-current-actor-groups" style="text-transform: capitalize">${createActorGroupOptions(
          currentActorGroups,
        )}</select>
       </div>
       <div class="form-group">
        <label>Image :</label>
        <select id="mass-flip-images" style="text-transform: capitalize"></select>
      </div>
    </form>
  `

const createActorGroupOptions = (actorGroups) => {
  if (actorGroups.size === 0) {
    return '<option>Aucun acteur compatible sur la scène actuelle</option>'
  }

  return [...actorGroups].map(
    (actorGroup) => `<option value='${actorGroup}'>${decodeURI(actorGroup)}</option>`,
  )
}

const refreshImageOptions = (htm) => {
  const imageOptions = createImageOptions(htm)

  editInnerHtml(htm, '#mass-flip-images', imageOptions)
}

const createImageOptions = (htm) => {
  const currentActorGroupsLabel = getHtmValue(htm, '#mass-flip-current-actor-groups')

  console.log('currentActorGroupsLabel', currentActorGroupsLabel)

  const actorGroup = knownActorGroups[currentActorGroupsLabel]
  if (actorGroup === undefined) {
    return '<option>Aucune option disponible</option>'
  }

  const { images } = actorGroup

  return Object.keys(images)
    .map((key) => `<option value='${key}'>${images[key].name}</option>`)
    .toString()
}

try {
  const {
    tokens: { ownedTokens },
  } = canvas

  const currentActorGroups = new Set(
    ownedTokens
      .map((token) => encodeURI(token.document.name))
      .filter((encodedTokenName) =>
        Object.keys(knownActorGroups).includes(encodedTokenName),
      ),
  )

  openDialog(canvas, currentActorGroups)
} catch (error) {
  ui.notifications.error("Erreur, voir la console pour plus d'information")
  console.error(error)
}
