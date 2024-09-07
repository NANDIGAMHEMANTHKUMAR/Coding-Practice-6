const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'covid19India.db')
let dataBase = null

const initialDbAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is started http://localhost/3000...')
    })
  } catch (erorr) {
    console.log(`DB Error${erorr.message}`)
    process.exit(1)
  }
}
initialDbAndServer()

// APL 1
app.get('/states/', async (request, response) => {
  const getSqliteQuery = `
    SELECT * FROM state;`
  const stateDetail = await dataBase.all(getSqliteQuery)
  response.send(stateDetail)
})

//API 2
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getSqliteQueryWithStateId = `
    SELECT * FROM state WHERE state_id = '${stateId}';`
  const stateDetailsWithId = await dataBase.get(getSqliteQueryWithStateId)
  response.send(stateDetailsWithId)
})

//API 3
app.post('/districts/', async (request, response) => {
  const districtDetails = request.body
  const {districtName, stateId, cases, cured, active, deaths} = districtDetails
  const postSqliteQuery = `
    INSERT INTO
      district (district_name,state_id,cases,cured,active,deaths)
    VALUES
      (
        '${districtName}',
         '${stateId}',
        '${cases}',
        '${cured}',
         '${active}',
        '${deaths}'
      );`
  const addeddistrict = await dataBase.run(postSqliteQuery)
  response.send('District Successfully Added')
})

//API 4
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getSqliteQueryWithStateId = `
    SELECT * FROM district WHERE district_id = '${districtId}';`
  const getDistrictsDetailsWithId = await dataBase.get(
    getSqliteQueryWithStateId,
  )
  response.send(getDistrictsDetailsWithId)
})

//API 5
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getSqliteQueryWithStateId = `
    DELETE FROM district WHERE district_id = '${districtId}';`
  const deleteDistric = await dataBase.get(getSqliteQueryWithStateId)
  response.send('District Removed')
})

//API 6

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const putSqliteQuery = `
    UPDATE
      district 
    SET 
      district_name = '${districtName}',
       state_id =  '${stateId}',
       cases = '${cases}',
       cured = '${cured}',
       active = '${active}',
        deaths ='${deaths}' 
        WHERE district_id = ${districtId};`
  const updatedistrict = await dataBase.run(putSqliteQuery)
  response.send('District Details Updated')
})

//API 7
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getTotalCasesQuery = `
  SELECT 
  SUM(cases) as totalCases,
  SUM(cured) as totalCured,
  SUM(active) as totalActive,
  SUM(deaths) as totalDeaths
  FROM 
  district
  ;`
  const totalCases = await dataBase.get(getTotalCasesQuery)
  console.log(totalCases)
  response.send(totalCases)
})
//API 8
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const sqliteQuery = `
  SELECT 
  state_name AS stateName
  FROM
  district INNER JOIN state ON district.state_id = state.state_id
  WHERE 
  district_id ='${districtId}'`
  const stateName = await dataBase.get(sqliteQuery)
  response.send(stateName)
})

module.exports = app
