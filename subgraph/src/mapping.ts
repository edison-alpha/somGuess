import { GuessResult as GuessResultEvent, NumbersGenerated as NumbersGeneratedEvent } from "../generated/NumberGuess/NumberGuess"
import { GuessResult, NumbersGenerated } from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts"

export function handleGuessResult(event: GuessResultEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new GuessResult(Bytes.fromHexString(event.transaction.hash.toHex()))
  entity.player = event.params.player
  entity.betAmount = event.params.betAmount
  entity.generatedNumbers = event.params.generatedNumbers
  entity.correctNumber = event.params.correctNumber
  entity.userGuess = event.params.userGuess
  entity.payout = event.params.payout
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleNumbersGenerated(event: NumbersGeneratedEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new NumbersGenerated(Bytes.fromHexString(event.transaction.hash.toHex()))
  entity.player = event.params.player
  entity.numbers = event.params.numbers
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

// Management Contract Handlers
import { LeaderboardUpdated as LeaderboardUpdatedEvent, StatsUpdated as StatsUpdatedEvent, TransactionRecorded as TransactionRecordedEvent } from "../generated/Management/Management"
import { LeaderboardEntry, PlayerStats, GameTransaction } from "../generated/schema"

export function handleLeaderboardUpdated(event: LeaderboardUpdatedEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new LeaderboardEntry(Bytes.fromHexString(event.transaction.hash.toHex()))
  entity.player = event.params.player
  entity.totalWinnings = event.params.totalWinnings
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleStatsUpdated(event: StatsUpdatedEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new PlayerStats(Bytes.fromHexString(event.transaction.hash.toHex()))
  entity.player = event.params.player
  entity.isWin = event.params.isWin
  entity.payout = event.params.payout
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleTransactionRecorded(event: TransactionRecordedEvent): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let entity = new GameTransaction(Bytes.fromHexString(event.transaction.hash.toHex()))
  entity.player = event.params.player
  entity.transactionId = event.params.transactionId
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()
}
