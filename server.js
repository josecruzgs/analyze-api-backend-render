import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const app = express()

const allowedOrigins = ['http://localhost:3000', 'https://www.cesarchan.com']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json({ limit: '10mb' }))

app.post('/analyze', async (req, res) => {
  const { messages } = req.body
  if (!messages) return res.status(400).json({ result: 'Mensajes vacíos' })

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1800
      })
    })

    const data = await response.json()
    if (data.error) {
      console.error('❌ OpenAI Error:', data.error)
      return res.status(500).json({ result: data.error.message })
    }

    const content = data.choices?.[0]?.message?.content
    return res.json({ result: content })
  } catch (err) {
    console.error('❌ Server error:', err)
    res.status(500).json({ result: 'Fallo al contactar OpenAI' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`))
