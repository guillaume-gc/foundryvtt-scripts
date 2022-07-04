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
  `<option value="">Choisisser un objet</option>` +
  items.map(
    (i) => `<option value="${i.id}">${i.name} <i>(Poids: ${i.weight})</i></option>`,
  )

const d = new Dialog({
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
      label: 'Set Weight',
      callback: async (htm) => {
        const itemId = htm.find('#itemSelect')[0].value
        if (!itemId) return
        const newWeight = parseFloat(htm.find('#newWeight')[0].value)
        await actor.items
          .get(itemId)
          .update({ 'data.weight': newWeight, 'data.baseWeight': newWeight })
      },
    },
  },
}).render(true)
