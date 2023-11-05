const Growatt = require('growatt')
const { Cron } = require("croner");
const Secret = require('./secret.json')
const Mqtt = require("mqtt");
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const mqttServer = Secret.mqtt.ip+':'+ Secret.mqtt.port
const mqttOption = {
  clientId,
  connectTimeout: 4000,
  username: Secret.mqtt.user,
  password: Secret.mqtt.password,
  reconnectPeriod: 1000,
}

let mqttClient = Mqtt.connect("mqtt://"+mqttServer,mqttOption)


mqttClient.on('connect', () => {
  console.log('Connected to MQTT')
  startJob()
})


const user = Secret.growatt.user
const passwort = Secret.growatt.password
const options={}

async function getData() {
  const growatt = new Growatt({})
  let login = await growatt.login(user,passwort).catch(e => {
    console.log(e)
  })

  if (login = 1){
    console.log("Logged in to growatt ")
    let getAllPlantData = await growatt.getAllPlantData(options).catch(e => {
      console.log(e)
    })
    
    mqttClient.publish(Secret.mqtt.topic, JSON.stringify(getAllPlantData))


    let logout = await growatt.logout().catch(e => {
      console.log(e)
    })
  
    console.log('logout: ',logout)
  }

 
}

function startJob(){
  console.log('Setting up Cron job every fifth minute');
  const job = Cron('*/5 * * * *', () => {
    console.log('New job');
    getData()
  });
}




