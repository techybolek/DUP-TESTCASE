//@ts-check

const WS_URL = 'ws://localhost:8765'

/**
 * @param {{ domain: any; model: any; userPrompt: any; textHandler: any; imageHandler: any; }} args
 */
export function processPrompt(args) {
  const { domain, model, userPrompt, textHandler, imageHandler } = args

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {

      console.log('Connection opened: ', model)
      const data = {
        domain,
        model,
        userPrompt
      }

      ws.send(JSON.stringify(data));
    }

    /**
     * @param {any} data
     */
    function defaultTextHandler(data) {
      const dto = JSON.parse(data);
      console.log('Received:', dto);
    }

    /**
     * @param {any} data
     */
    function defaultImageHandler(data) {
      console.log('Image received', data)
    }

    ws.onmessage = function (event) {
      const data = event.data;
      const type = typeof data;
      if (type === 'string') {
        const _text_handler = textHandler || defaultTextHandler

        _text_handler(data)
      } else {
        console.log('Non-string data received:', type, data)
        const _image_handler = imageHandler || defaultImageHandler
        console.log('WS Client: Invoking image handler')
        _image_handler(data)
      }
    }

    ws.onclose = event => {
      console.log('Connection closed: ', model, event);
      resolve(null);
    }

    ws.onerror = event => {
      console.error('WebSocket Error: ', event)
      reject(null)
    }
  })
}