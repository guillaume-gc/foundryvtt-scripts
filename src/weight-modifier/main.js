const items = actor.items
  .filter(({ type }) =>
    [
      'equipment',
      'loot',
      'weapon',
      'consumable',
      'consumable',
      'container',
    ].includes(type),
  )
  .map((o) => ({ name: o.name, id: o.id, weight: o.data?.data?.weight }))
const itemOptions =
  '<option>Choisissez un objet</option>' +
  items.map(
    (i) =>
      `<option value="${i.id}">${i.name} <i>(Poids: ${i.weight})</i></option>`,
  )

new Dialog({
  title: "Changement de Poids d'un Objet",
  content: `
        <form class="flexcol">
            <div class="form-group">
                <label>Acteur :</label>
                <p>${actor.name}</p>
            </div>
            <div class="form-group">
                <label>Objet :</label>
                <select id="itemSelect">${itemOptions}</select>
            </div>
            <div class="form-group">
                <label>Nouveau poids :</label>
                <input type="number" id="newWeight" placeholder="Entrez un nouveau poids">
            </div>
        </form>
    `,
  buttons: {
    change: {
      label: 'Changer le poids',
      callback: async (htm) => {
        const itemId = htm.find('#itemSelect')?.[0]?.value
        const newWeight = parseFloat(htm.find('#newWeight')?.[0]?.value)

        if (itemId == null || newWeight == null) {
          console.log(
            `Weight Modifier | Item ID "${itemId}" or Weight "${newWeight}" is undefined`,
          )
          return
        }

        console.log(
          `Weight Modifier | Setting item ${itemId} weight to ${newWeight}`,
        )

        await actor.items
          .get(itemId)
          .update({ 'data.weight': newWeight, 'data.baseWeight': newWeight })
      },
    },
  },
}).render(true)
