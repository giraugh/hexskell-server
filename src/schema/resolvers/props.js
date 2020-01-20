const User = require('../../model/User')
const Bot = require('../../model/Bot')
const Match = require('../../model/Match')

const toQueryRes = obj => obj.toObject({getters: true})
const resolveID = obj => ({...obj, id: obj._id})
const resolveDate = field => obj => ({...obj, [field]: (new Date(obj[field])).toISOString()})
const resolveLink = (field, model, resolver) => obj => ({
  ...obj, [field]: model.findById(obj[field]).then(x => x && resolver(x))
})
const resolveLinks = (field, model, resolver) => obj => ({
  ...obj, [field]: model.find({_id: {$in: obj[field]}}).map(x => x.map(y => y && resolver(y)))
})

const resolveBot = obj =>
  Promise.resolve(obj)
    .then(toQueryRes)
    .then(resolveID)
    .then(resolveDate('dateCreated'))
    .then(resolveLink('author', User, resolveUser))
    .then(resolveLinks('tournamentMatches', Match, resolveMatch))
    .then(resolveLinks('wonTournamentMatches', Match, resolveMatch))

const resolveUser = obj =>
  Promise.resolve(obj)
    .then(toQueryRes)
    .then(resolveID)
    .then(resolveDate('dateJoined'))
    .then(resolveLinks('createdBots', Bot, resolveBot))

const resolveGameState = obj => ({
  ...obj,
  red: obj.red.map(([x, y]) => ({x, y})),
  blue: obj.blue.map(([x, y]) => ({x, y}))
})

const resolveRound = obj =>
  Promise.resolve(obj)
    .then(toQueryRes)
    .then(obj => ({...obj, winner: obj.winner.toUpperCase()}))
    .then(obj => ({...obj, redPlayer: resolveBot(obj.players.red), bluePlayer: resolveBot(obj.players.blue)}))
    .then(obj => ({
      ...obj,
      terminalState: resolveGameState(JSON.parse(obj.terminalState)),
      terminalStateStr: obj.terminalState
    }))

const resolveMatch = obj =>
  Promise.resolve(obj)
    .then(toQueryRes)
    .then(resolveID)
    .then(resolveLinks('competitors', Bot, resolveBot))
    .then(resolveLink('winningCompetitor', Bot, resolveBot))
    .then(obj => ({...obj, round: ({number}) => obj.rounds[number - 1] && resolveRound(obj.rounds[number - 1])}))
    .then(obj => ({...obj, rounds: _ => obj.rounds.map(resolveRound)}))

module.exports = { resolveBot, resolveUser, resolveMatch }