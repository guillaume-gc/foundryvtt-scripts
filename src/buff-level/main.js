const openDialog = (actor) => {
  if (actor == null) {
    ui.notifications.warn('Aucun acteur selectionné')
    return
  }

  const items = actor.items
    .filter(({ type }) => type === 'buff')
    .map((o) => ({ id: o.id }))

  new Dialog({
    title: 'Changement de niveau des buffs',
    content: `
        <form class="flexcol">
            <div class="form-group">
                <label>Acteur :</label>
                <p>${actor.name}</p>
            </div>
            <div class="form-group">
                <label>Nombre de buffs :</label>
                <p>${items.length}</p>
            </div>
            <div class="form-group">
                <label>Nouveau niveau :</label>
                <input type="number" id="newWeight" placeholder="Entrez un nombre">
            </div>
            <div class="form-group">
                <p><b>Attention</b> : Cette action n'est pas reversible !</p>
            </div>
        </form>
    `,
    buttons: {
      change: {
        label: 'Changer le niveau',
        callback: async (htm) => {
          const newLevel = parseFloat(htm.find('#newWeight')?.[0]?.value)

          if (isNaN(newLevel)) {
            console.log(`Buff Level | "${newLevel}" is undefined`)
            ui.notifications.warn("Le niveau entré n'est pas correct")
            return
          }

          console.log(
            `Buff Level | Setting ${items.length} levels to ${newLevel}`,
          )

          const promises = items.map(({ id }) =>
            actor.items.get(id).update({ 'data.level': newLevel }),
          )

          await Promise.all(promises)

          console.log(`Buff Level | Complete`)

          ui.notifications.info(
            `${items.length} buffs ont été mis au niveau ${newLevel}`,
          )
        },
      },
    },
  }).render(true)
}

openDialog(actor)
