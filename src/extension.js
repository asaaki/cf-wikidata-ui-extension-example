/* global fetch */
const cfe = window.contentfulExtension

/*
Useful links/resources:
https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
https://developer.mozilla.org/en-US/docs/Web/API/Response
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
*/

const extension = (api) => {
  const entityLabel = document.getElementById('entityLabel')
  const wikiDataId = document.getElementById('wikiDataId')
  const errorField = document.getElementById('errors')
  const nameField = api.entry.fields.name
  const defaultLocale = api.locales.default
  const wikiDataIdEventListener = (ev) => {
    /*
    TODO:
    - entity IDs must start with "Q", properties with "P"
    - following input must be numeric, not smaller than 1
    - so, minimum length is 2 (like Q1)
    */
    const wdId = (ev.target.value || '').trim()
    const url = `https://www.wikidata.org/wiki/Special:EntityData/${wdId}.json`
    const responseHandler = (response) => {
      if (response.ok) {
        return response.json() // is a Promise
      } else {
        const err = new Error('Request failed')
        err.response = response
        return Promise.reject(err)
      }
    }
    const payloadHandler = (payload) => {
      const entity = payload.entities[wdId]
      const labels = entity.labels
      const fieldUpdater = (locale) => {
        const localizedName = (labels[locale] || labels[defaultLocale] || { value: '' }).value
        nameField.setValue(localizedName, locale)
        entityLabel.textContent += `${locale}:${localizedName} `
      }

      entityLabel.textContent = ''
      nameField.locales.forEach(fieldUpdater)
    }
    const errorHandler = (error) => {
      if (error.response) {
        errorField.textContent = 'Invalid input or error in requesting the data'
        console.log(`Fetch for "${error.response.url}" failed: ${error.message}`)
      } else {
        console.log(`Unknown error happened: ${error.message}`)
      }
    }

    errorField.textContent = ''
    fetch(url)
      .then(responseHandler)
      .then(payloadHandler)
      .catch(errorHandler)
    api.field.setValue(wdId)
  }

  api.window.updateHeight()
  api.window.startAutoResizer()
  wikiDataId.value = api.field.getValue()
  wikiDataId.addEventListener('input', wikiDataIdEventListener)
}

cfe.init(extension)
