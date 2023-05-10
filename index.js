const TelegramBot = require('node-telegram-bot-api')
const express = require('express')
const cors = require('cors')

const token = '1822310114:AAGCXLbsxTVOwGzHBQLaGLC7HlJhekKnzzY'
const webAppUrl = 'https://test-learning-tg-web-app--papaya-frangipane-b7497e.netlify.app'
const PORT = 8000

const bot = new TelegramBot(token, {polling: true})
const app = express()

app.use(express.json())
app.use(cors())

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
      reply_markup: {
        keyboard : [
          [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
        ]
      }
    })

    await bot.sendMessage(chatId, 'Заходи в наш магазин по ссылке ниже', {
      reply_markup: {
        inline_keyboard : [
          [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
        ]
      }
    })
  }
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data)

      await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
      await bot.sendMessage(chatId, `Ваш город: ${data.city}`)
      await bot.sendMessage(chatId, `Ваша улица: ${data.street}`)
      await bot.sendMessage(chatId, `Ваш субьект: ${data.subject}`)
    } catch (e) {
      console.log(e)
    }
  }
})

app.post('/web-data', async (req, res) => {
  const {queryId, products, totalPrice} = req.body
  console.log("recieved")

  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: {
        message_text: `Поздравляем с покупкой, вы приобрели товары на сумму ${totalPrice}. Список товаров: ${products.map(item => item.title).join(", ")}`
      }
    })
    return res.status(200).json({})
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: 'Не удалось приобрести товары',
      input_message_content: {
        message_text: `Не удалось приобрести товары`
      }
    })
    return res.status(500).json({})
  }
})

app.get('/get', async (req, res) => {
  await console.log("received")

  return res.status(200).json({data: "received"})
})

app.listen(PORT, () => console.log('server started on PORT ' + PORT))