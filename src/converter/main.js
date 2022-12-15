let showMessage = false
new Dialog({
  title: 'Convertisseur',
  content: `
    <form>
      <div class="form-group">
        <label>Valeur :</label>
        <input type='number' name='inputField' />
      </div>
      <div class="form-group">
        <select name='converterType'>
          <option value="mtf" selected>Mètres vers Pieds</option>
          <option value="ftm">Pieds vers Mètres</option>
          <option value="lvk">Livres vers Kilos</option>
          <option value="kvl">Kilos vers Livre</option>
        </select>
      </div>
    </form>
    `,
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: 'Convertir',
      callback: () => {
        showMessage = true
      },
    },
    no: {
      icon: "<i class='fas fa-times'></i>",
      label: 'Quitter',
      callback: () => {
        showMessage = false
      },
    },
  },
  default: 'no',
  close: (html) => {
    if (!showMessage) {
      console.log('Convertisseur | Apply change is false')
      return
    }
    const inputQuery = html.find('input[name="inputField"]')
    const inputValue = inputQuery?.[0]?.value
    if (!inputValue) {
      console.log('Convertisseur | No Input ', inputQuery)
      return
    }
    const inputNumber = parseFloat(inputValue)
    if (isNaN(inputNumber)) {
      console.log(
        `Convertisseur | Input ${inputValue} is not number `,
        inputQuery,
      )
      return
    }

    const converterTypeQuery = html.find('select[name="converterType"]')
    const converterTypeValue = converterTypeQuery?.[0]?.value

    const dialogueData = {
      mtf: {
        resultValue: Math.floor(inputNumber / 1.5) * 5,
        inputName: 'mètre(s)',
        resultName: 'pied(s)',
      },
      ftm: {
        resultValue: Math.floor(inputNumber / 5) * 1.5,
        inputName: 'pied(s)',
        resultName: 'mètre(s)',
      },
      lvk: {
        resultValue: inputNumber / 2,
        inputName: 'livre(s)',
        resultName: 'kilo(s)',
      },
      kvl: {
        resultValue: inputNumber * 2,
        inputName: 'kilo(s)',
        resultName: 'livre(s)',
      },
    }

    const currentDialogueData = dialogueData[converterTypeValue]
    if (currentDialogueData == null) {
      console.log(
        `Convertisseur | Dialogue Data not found `,
        converterTypeValue,
        converterTypeQuery,
      )
    }

    const { resultValue, inputName, resultName } = currentDialogueData

    ui.notifications.info(
      `<b>${inputValue}</b> ${inputName} -> <b>${resultValue}</b> ${resultName}`,
    )
  },
}).render(true)
