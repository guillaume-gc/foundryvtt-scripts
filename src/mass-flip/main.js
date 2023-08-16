const knownActorGroups = {
  // Cheval Léger
  'Cheval%20L%C3%A9ger': {
    images: {
      idle: {
        name: 'Immobile',
        fileName: 'horse-*-plain-idle.webm',
      },
      walk: {
        name: 'Marcher',
        fileName: 'horse-*-plain-walk.webm',
      },
      run: {
        name: 'Galoper',
        fileName: 'horse-*-plain-gallop.webm',
      },
    },
  },
}

const openDialog = (canvas, currentActorGroups, ownedTokens) => {
  const form = createForm(currentActorGroups)

  new Dialog({
    title: 'Mass flip',
    content: form,
    buttons: {
      use: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: 'Confirmer le flip',
        callback: (htm) => flipTokens(htm, canvas, ownedTokens),
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

const flipTokens = (htm, canvas, ownedTokens) => {
  const actorGroupsLabel = getHtmValue(htm, '#mass-flip-current-actor-groups')
  const decodedActorGroup = decodeURI(actorGroupsLabel)

  const actorGroup = knownActorGroups[actorGroupsLabel]
  if (actorGroup === undefined) {
    throw new Error(`Actor group "${decodedActorGroup}" not known`)
  }

  console.log('actorGroup', actorGroup)

  const imageLabel = getHtmValue(htm, '#mass-flip-images')

  const actorGroupFileName = actorGroup.images[imageLabel].fileName
  if (actorGroupFileName === undefined) {
    throw new Error(`Image type "${imageLabel}" not known for ${decodedActorGroup} actor group`)
  }

  console.log('ownedTokens', ownedTokens)

  const tokensGroup = ownedTokens.filter((token) => token.document.name === decodedActorGroup)
  if (tokensGroup.length === 0) {
    throw new Error(`Token group ${decodedActorGroup} has no controlled token present in the scene`)
  }

  for (const token of tokensGroup) {
    const relativeTextureTempFileName = getRelativeTextureFileName(token.document.texture.src)

    console.log('actorGroupFileName', actorGroupFileName)
    console.log('relativeTextureTempFileName', relativeTextureTempFileName)

    const newTextureRelativeFileName = handleWildCard(actorGroup, actorGroupFileName, relativeTextureTempFileName)

    console.log('newTextureRelativeFileName', newTextureRelativeFileName)
  }
}

const handleWildCard = (actorGroup, actorGroupFileName, relativeTextureTempFileName) => {
  if (!actorGroupFileName.includes('*')) {
    return actorGroupFileName
  }

  const tokenCurrentTextureWildCartValue = getTokenCurrentTextureWildCartValue(actorGroup, relativeTextureTempFileName)

  console.log('tokenCurrentTextureWildCartValue', tokenCurrentTextureWildCartValue)

  return actorGroupFileName.replace('*', tokenCurrentTextureWildCartValue)
}

const getRelativeTextureFileName = (textureFullFileName) => {
  const pathArray = textureFullFileName.split('/')

  return pathArray[pathArray.length - 1]
}

const getTokenCurrentTextureWildCartValue = (actorGroup, relativeTextureTempFileName) => {
  for (const image of Object.values(actorGroup.images)) {
    const [beforeWildCard, afterWildCard] = image.fileName.split('*')
    if (!(relativeTextureTempFileName.includes(beforeWildCard) && relativeTextureTempFileName.includes(afterWildCard))) {
      continue
    }

    return relativeTextureTempFileName
      .replace(beforeWildCard, '')
      .replace(afterWildCard, '')
  }

  throw new Error(`Could not find texture ${relativeTextureTempFileName} actor group`)
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
    .join('')
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

  openDialog(canvas, currentActorGroups, ownedTokens)
} catch (error) {
  ui.notifications.error("Erreur, voir la console pour plus d'information")
  console.error(error)
}
