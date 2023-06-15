import { createTranslator } from 'next-intl'
import {
  OpenAIStream,
  checkString,
  ChatGPTCompletionRequest,
  isNewModel
} from '../../utils/OpenAIStream'
import { verifySignature } from '../../utils/auth'

export const config = {
  runtime: 'edge',
  unstable_allowDynamic: ['/node_modules/js-sha256/src/sha256.js']
}

const handler = async (req: Request): Promise<Response> => {
  const {
    description,
    good,
    bad,
    locale,
    time,
    sign,
    userApiKey,
    userModel: _userModel
  } = (await req.json()) as {
    description: string
    good?: string
    bad?: string
    locale: 'zh' | 'en'
    time: number
    sign: string
    userApiKey?: string
    userModel?: string
  }

  const userModel = _userModel || process.env.OPENAI_MODEL

  if (!userModel) {
    throw new Error('Missing env var OPENAI_MODEL from OpenAI')
  }

  if (
    !(await verifySignature(
      {
        t: time,
        m: description || ''
      },
      sign
    ))
  ) {
    const statusText = 'Invalid signature'
    return new Response(statusText, { status: 400, statusText })
  }

  if (!description) {
    const statusText = 'No description in the request'
    return new Response(statusText, { status: 400, statusText })
  }

  if (!locale) {
    const statusText = 'No locale in the request'
    return new Response(statusText, { status: 400, statusText })
  }

  if (userModel === 'gpt-4' && !userApiKey) {
    const statusText = 'OpenAI API Key not support gpt-4 model'
    return new Response(statusText, { status: 400, statusText })
  }

  let messages = {}
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch (e) {
    const statusText = 'No locale in the request'
    return new Response(statusText, { status: 400, statusText })
  }

  const keys = userApiKey || process.env.OPENAI_API_KEY || ''
  const [apiKey] = keys.split(',').sort(() => Math.random() - 0.5)
  if (!checkString(apiKey)) {
    const statusText = 'OpenAI API Key Format Error'
    return new Response(statusText, { status: 400, statusText })
  }

  const t = createTranslator({
    locale,
    namespace: 'Index',
    messages
  })
  let prompt = `${t('prompt', {
    description
  })}`

  if (good || bad) {
    prompt += t('code_tip')
    bad &&
      (prompt += t('bad', {
        code: bad
      }))
    good &&
      (prompt += t('good', {
        code: good
      }))
  }

  const payload: ChatGPTCompletionRequest = {
    model: userModel,
    temperature: 0.6,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000,
    stream: true,
    n: 1
  }

  if (isNewModel(payload.model)) {
    payload.messages = [{ role: 'user', content: prompt }]
  } else {
    payload.prompt = prompt
  }

  try {
    const { status, stream, statusText } = await OpenAIStream(apiKey, payload)

    if (status !== 200) {
      return new Response(statusText, { status, statusText })
    }

    return new Response(stream, {
      headers: new Headers({
        // since we don't use browser's EventSource interface, specifying content-type is optional.
        // the eventsource-parser library can handle the stream response as SSE, as long as the data format complies with SSE:
        // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server

        'Cache-Control': 'no-cache'
      })
    })
  } catch (e: any) {
    const errMsg = e?.message || 'OpenAI Service Error'
    return new Response(errMsg, { status: 500, statusText: errMsg })
  }
}

export default handler
