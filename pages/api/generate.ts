import { createTranslator } from 'next-intl'
import {
  OpenAIStream,
  ChatGPTCompletionRequest,
  isNewModel
} from '../../utils/OpenAIStream'
import { verifySignature } from '../../utils/auth'

if (process.env.NEXT_PUBLIC_USE_USER_KEY !== 'true') {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing env var from OpenAI')
  }
}

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
    return new Response('Invalid signature', { status: 400 })
  }

  if (!description) {
    return new Response('No description in the request', { status: 400 })
  }

  if (!locale) {
    return new Response('No locale in the request', { status: 400 })
  }
  let messages = {}
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch (e) {
    return new Response('No locale in the request', { status: 400 })
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
    userApiKey: userApiKey?.startsWith('sk-') ? userApiKey : '',
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
    const { status, stream, statusText } = await OpenAIStream(payload)

    if (status !== 200) {
      return new Response(statusText, { status, statusText })
    }

    return new Response(stream)
  } catch (e: any) {
    const errMsg = e?.message || 'OpenAI Service Error'
    return new Response(errMsg, { status: 500, statusText: errMsg })
  }
}

export default handler
