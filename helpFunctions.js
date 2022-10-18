import axios from 'axios';
import {API_KEY} from './index.js'
async function GetCoord(city){
    let coord
await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`).then(
    (response) => {
 coord = response.data.coord
    },
    (error) => {
        console.log(error)
    }
)
    return {lon: coord.lon, lat: coord.lat}
    }

function CreateForecastMessage(weatherData){
        const weekday = ['Неділя', 'Понеділок','Вівторок','Середа','Четвер', 'П\'ятниця', 'Субота']
        let response = 'Прогноз погоди у Києві:'
        let day = ''
        weatherData.forEach((value) => {
            let date = new Date(value.dt_txt)
            if (day != weekday[date.getDay()]){
                day = weekday[date.getDay()]
                response += '\n\n'+day
            }
         response += '\n '+date.getHours()+":"+date.getMinutes()+"0 Температура "+value.main.temp.toFixed(0)+", відчувається як "+value.main.feels_like.toFixed(0)+", "+value.weather[0].description
        
        })
    return response
    }

export{
    GetCoord,
    CreateForecastMessage,
}
