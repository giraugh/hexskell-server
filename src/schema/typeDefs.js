const { gql } = require('apollo-server-express')

const typeDefs = gql`
  enum Player {
    RED
    BLUE
  }

  enum SortOrder {
    INCREASING,
    DECREASING
  }

  enum BotSorting {
    ALPHABETICALLY,
    DATE_CREATED,
    NUMBER_WINS
  }

  enum BotFilter {
    PUBLISHED,
    MINE
  }

  type BotRequestOptions {
    offset: Int,
    amount: Int,
    search: String,
    filters: [BotFilter!]
    sortBy: BotSorting,
    sortOrder: SortOrder
  }
  
  type Bot {
    id: ID!
    name: String!
    code: String!
    author: User!
    dateCreated: String!
    published: Boolean!
    tournamentMatches: [Match!]!
    wonTournamentMatches: [Match!]!
    wins: Int!
  }

  type Piece {
    x: Int
    y: Int
  }

  type GameState {
    red: [Piece]
    blue: [Piece]
  }

  type Round {
    redPlayer: Bot!
    bluePlayer: Bot!
    winner: Player!
    terminalState: GameState!
    terminalStateStr: String!
  }

  type Match {
    id: ID!
    rounds: [Round!]!
    round(number: Int!): Round
    competitors: [Bot!]!
    winningCompetitor: Bot
  }

  type User {
    id: ID!
    displayName: String!
    dateJoined: String!
    createdBots: [Bot!]!
    avatarURL: String
  }
  
  type Query {
    # Bots
    bots(options: BotRequestOptions): [Bot!]!
    bot(id: ID, name: String): Bot

    # Users
    me: User  # uses session to return info on currently logged-in user
    users: [User!]!
    user(id: ID, displayName: String): User

    # Matches
    matches: [Match!]!
  }

  type Mutation {
    # Bots
    newBot(name: String!, code: String!): Bot!
    removeBot(id: ID!): Bot
    setBot(id: ID!, name: String, code: String): Bot
    publishBot(id: ID!): Bot
    unpublishBot(id: ID!): Bot
  
    # Users
    removeUser(id: ID!): User
    setUser(displayName: String!): User

    # Matches
    competeBots(competitors: [ID!]!): Match
    removeMatches: [Match]
  }
`

module.exports = typeDefs
