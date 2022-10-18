import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import { GetCoord,CreateForecastMessage} from './helpFunctions.js'
const API_KEY = '0cf7db307f1a6c0d7dc14e8686cc96f2'
const TOKEN = "5784413360:AAG09IYnxTTDt9JDBRQ4Uu5U9-r2_t3PYeo"
let city = 'Kyiv'
const StartMenu = {
    "reply_markup": {
        "keyboard": [["Прогноз у Києві"], ["Курс валют"]]
        }
    }
let MonoData
async function UpdateMonoData(){
    const URL = 'https://api.monobank.ua/bank/currency'
   await axios.get(URL).then(
    (response) => {
        MonoData = response.data
        MonoData = MonoData.filter((value) => value.currencyCodeB == 980 && (value.currencyCodeA == 840 || value.currencyCodeA == 978))
        if (MonoData[0].currencyCodeA == 840){
    const temp = MonoData[1]
    MonoData[1] = MonoData[0] 
    MonoData[0] = temp
    }
    },
(error) => {
    console.log(error)
})
}

UpdateMonoData()

setInterval(UpdateMonoData, 330000);

const bot = new TelegramBot(
    TOKEN,
    {polling: true}
)

bot.onText(/Кожні (3|6) годин/i, async (msg) => {
const hours = msg.text[6]
const coord = await GetCoord(city)
const URL =  `https://api.openweathermap.org/data/2.5/forecast?lat=${coord.lat}&lon=${coord.lon}&appid=${API_KEY}&lang=ua&units=metric`
let weatherData
await axios.get(URL).then(
    (response) => {
        weatherData = response.data.list
        let message
if (hours == '3'){
message = CreateForecastMessage(weatherData)}
else{
message = CreateForecastMessage(weatherData.filter((element, index) => index%2 == 0))
}
bot.sendMessage(msg.chat.id, message)
    },
    (error) => {
        console.log(error)
    }
)
})

bot.onText(/^Privat/i,async(msg) => {
const date = new Date()
const URL = `https://api.privatbank.ua/p24api/exchange_rates?json&date=${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`
let currencyData
await axios.get(URL).then(
    (response) => {
        currencyData = response.data.exchangeRate
        currencyData = currencyData.filter((value) => value.currency == 'USD' || value.currency == 'EUR')
let message = `Купівля/Продаж

 EUR
 ${currencyData[0].purchaseRate.toFixed(3)}/${currencyData[0].saleRate.toFixed(3)}
 USD
 ${currencyData[1].purchaseRate.toFixed(3)}/${currencyData[1].saleRate.toFixed(3)}`
    
bot.sendMessage(msg.chat.id, message)
    },
    (error) => {
        console.log(error)
    }
)

    
})

bot.onText(/^Mono/i, async(msg) => {
    let response = `Купівля/Продаж

    EUR
    ${MonoData[0].rateBuy.toFixed(3)}/${MonoData[0].rateSell.toFixed(3)}
    USD
    ${MonoData[1].rateBuy.toFixed(3)}/${MonoData[1].rateSell.toFixed(3)}`

bot.sendMessage(msg.chat.id, response)

})

bot.onText(/^Курс/i, (msg) => {
    bot.sendMessage(msg.chat.id, 'Оберіть банк', {
        "reply_markup": {
            "keyboard": [["Mono", "Privat"],['Повернутись']]
            }
        })
})

bot.onText(/^Прогноз/i, (msg) => {
    city = 'Kyiv'
    bot.sendMessage(msg.chat.id, 'Оберіть проміжок', {
        "reply_markup": {
            "keyboard": [["Кожні 3 години", "Кожні 6 годин"], ['Повернутись']]
            }
        })
})

bot.onText(/\/start/,(msg) => {
    bot.sendMessage(msg.chat.id, "Головне меню", StartMenu);
    });

bot.onText(/^Повернутись/i, (msg) => {
    bot.sendMessage(msg.chat.id, "Головне меню", StartMenu);
});
   
export{
    API_KEY
}
