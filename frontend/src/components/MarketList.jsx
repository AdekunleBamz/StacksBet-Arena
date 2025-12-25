import React, { useEffect, useMemo, useState } from 'react'
import { HiClock, HiUsers, HiCurrencyDollar } from 'react-icons/hi'
import { openContractCall } from '@stacks/connect'
import { uintCV, standardPrincipalCV, PostConditionMode, makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions'
import toast from 'react-hot-toast'

import { CONFIG } from '../lib/config'
import { fetchStacksTipHeight, optionalFromClarityJson } from '../lib/hiro'
import { readOnly } from '../lib/contract'

const MarketList = ({ userData, userAddress, userSession, network, contractAddress, contractName, onConnect, filterUserBets }) => {
  const [selectedMarket, setSelectedMarket] = useState(null)
  const [betAmount, setBetAmount] = useState('')
  const [betSide, setBetSide] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const [markets, setMarkets] = useState([])
  const [tipHeight, setTipHeight] = useState(null)
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadMarkets() {
      if (!contractAddress || !contractName) return
      setIsLoadingMarkets(true)
      try {
        const tip = await fetchStacksTipHeight(CONFIG.hiroApiUrl)
        if (cancelled) return
        setTipHeight(tip)

        const senderAddress = userAddress || contractAddress

        const nextIdJson = await readOnly({
          network,
          contractAddress,
          contractName,
          functionName: 'get-next-market-id',
          functionArgs: [],
          senderAddress,
        })

        const nextMarketId = Number(nextIdJson.value)
        const ids = []
        for (let i = 1; i < nextMarketId; i++) ids.push(i)

        const marketJsons = await Promise.all(
          ids.map((id) =>
            readOnly({
              network,
              contractAddress,
              contractName,
              functionName: 'get-market',
              functionArgs: [uintCV(id)],
              senderAddress,
            }).then((json) => ({ id, json }))
          )
        )

        const parsed = marketJsons
          .map(({ id, json }) => {
            const some = optionalFromClarityJson(json)
            if (!some) return null
            const tuple = some.value
            const v = tuple.value

            return {
              id,
              title: v.title.value,
              category: v.category.value,
              yesPoolMicro: Number(v['total-yes-amount'].value),
              noPoolMicro: Number(v['total-no-amount'].value),
              endBlock: Number(v['end-time'].value),
              creator: v.creator.value,
              resolved: v.resolved.value,
            }
          })
          .filter(Boolean)

        // Optional: filter to only markets where this user has a position.
        if (filterUserBets && userAddress) {
          const positions = await Promise.all(
            parsed.map((m) =>
              readOnly({
                network,
                contractAddress,
                contractName,
                functionName: 'get-position',
                functionArgs: [uintCV(m.id), standardPrincipalCV(userAddress)],
                senderAddress,
              }).then((posJson) => ({ id: m.id, posJson }))
            )
          )
          const hasBet = new Set(
            positions
              .filter(({ posJson }) => {
                const invested = Number(posJson.value['total-invested'].value)
                return invested > 0
              })
              .map(({ id }) => id)
          )
          if (!cancelled) setMarkets(parsed.filter((m) => hasBet.has(m.id)))
        } else {
          if (!cancelled) setMarkets(parsed)
        }
      } catch {
        if (!cancelled) setMarkets([])
      } finally {
        if (!cancelled) setIsLoadingMarkets(false)
      }
    }

    loadMarkets()
    return () => {
      cancelled = true
    }
  }, [contractAddress, contractName, filterUserBets, network, userAddress])

  const filteredMarkets = useMemo(() => {
    if (filter === 'all') return markets
    return markets.filter((m) => m.category.toLowerCase() === filter)
  }, [filter, markets])

  const getOdds = (market) => {
    const yesPool = market.yesPoolMicro / 1_000_000
    const noPool = market.noPoolMicro / 1_000_000
    const total = yesPool + noPool
    return {
      yes: total > 0 ? ((noPool / total) * 100).toFixed(1) : 50,
      no: total > 0 ? ((yesPool / total) * 100).toFixed(1) : 50
    }
  }

  const getTimeRemaining = (endBlock) => {
    if (tipHeight == null) return '—'
    const remaining = endBlock - tipHeight
    if (remaining <= 0) return 'Ended'
    const blocksPerDay = 144
    const days = Math.floor(remaining / blocksPerDay)
    const hours = Math.floor(((remaining % blocksPerDay) / blocksPerDay) * 24)
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`
  }

  const handlePlaceBet = async (market) => {
    if (!userData) { onConnect(); return }
    if (!userAddress) { toast.error('Wallet address not found. Reconnect your wallet and try again.'); return }
    if (!userSession) { toast.error('Wallet session not initialized. Refresh and reconnect.'); return }
    if (!betAmount || parseFloat(betAmount) < 0.1) { toast.error('Minimum bet is 0.1 STX'); return }
    if (!betSide) { toast.error('Select YES or NO'); return }

    setIsLoading(true)
    try {
      const amountInMicroSTX = Math.floor(parseFloat(betAmount) * 1000000)
      const outcome = betSide === 'yes' ? 1 : 2

      await openContractCall({
        appDetails: {
          name: 'StacksBet Arena',
          icon: window.location.origin + '/logo.png',
        },
        network,
        stxAddress: userAddress,
        contractAddress,
        contractName,
        functionName: 'place-bet',
        functionArgs: [uintCV(market.id), uintCV(outcome), uintCV(amountInMicroSTX)],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [makeStandardSTXPostCondition(userAddress, FungibleConditionCode.LessEqual, amountInMicroSTX)],
        userSession,
        onFinish: () => {
          toast.success('Bet placed successfully!')
          setBetAmount('')
          setBetSide(null)
          setSelectedMarket(null)
        },
        onCancel: () => toast.error('Transaction cancelled')
      })
    } catch (error) {
      toast.error('Failed to place bet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="markets" className="py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2"><span className="gradient-text">Prediction Markets</span></h2>
          <p className="text-gray-400">Choose a market and place your bet</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'crypto', 'sports', 'finance', 'defi'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === cat ? 'bg-arena-purple text-white' : 'glass-card text-gray-400 hover:text-white'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoadingMarkets && (
          <div className="glass-card rounded-2xl p-6 text-gray-400 flex items-center justify-center gap-3">
            <div className="spinner w-6 h-6" />
            Loading markets…
          </div>
        )}
        {filteredMarkets.map(market => {
          const odds = getOdds(market)
          const yesPool = market.yesPoolMicro / 1_000_000
          const noPool = market.noPoolMicro / 1_000_000
          return (
            <div key={market.id} className="market-card glass-card rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="category-badge px-3 py-1 rounded-full text-xs font-medium text-arena-purple">
                    {market.category}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <HiClock className="w-4 h-4" />
                    {getTimeRemaining(market.endBlock)}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 leading-tight">{market.title}</h3>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-yes font-medium">YES {odds.yes}%</span>
                    <span className="text-no font-medium">NO {odds.no}%</span>
                  </div>
                  <div className="odds-bar flex">
                    <div className="odds-yes" style={{ width: `${odds.yes}%` }} />
                    <div className="odds-no" style={{ width: `${odds.no}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><HiCurrencyDollar className="w-4 h-4" />{(yesPool + noPool).toLocaleString()} STX</span>
                  <span className="flex items-center gap-1"><HiUsers className="w-4 h-4" />—</span>
                </div>

                {selectedMarket === market.id ? (
                  <div className="space-y-3 pt-4 border-t border-arena-purple/20">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBetSide('yes')}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          betSide === 'yes' ? 'btn-yes text-white' : 'glass-card text-yes hover:bg-yes/10'
                        }`}
                      >
                        YES ({odds.yes}%)
                      </button>
                      <button
                        onClick={() => setBetSide('no')}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          betSide === 'no' ? 'btn-no text-white' : 'glass-card text-no hover:bg-no/10'
                        }`}
                      >
                        NO ({odds.no}%)
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        placeholder="Amount in STX"
                        className="input-field w-full px-4 py-3 rounded-xl text-white"
                        min="0.1"
                        step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">STX</span>
                    </div>
                    {betAmount && betSide && (
                      <div className="glass-card p-3 rounded-xl text-sm">
                        <p className="text-gray-400">Potential Win: <span className="text-white font-medium">
                          {(parseFloat(betAmount) * (parseFloat(betSide === 'yes' ? odds.yes : odds.no) / 100 + 1)).toFixed(2)} STX
                        </span></p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePlaceBet(market)}
                        disabled={isLoading || !betSide || !betAmount}
                        className="flex-1 btn-primary py-3 rounded-xl font-medium"
                      >
                        {isLoading ? <div className="spinner w-5 h-5 mx-auto" /> : 'Place Bet'}
                      </button>
                      <button
                        onClick={() => { setSelectedMarket(null); setBetAmount(''); setBetSide(null) }}
                        className="btn-secondary px-4 py-3 rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => userData ? setSelectedMarket(market.id) : onConnect()}
                    className="w-full btn-primary py-3 rounded-xl font-medium"
                  >
                    {userData ? 'Place Bet' : 'Connect to Bet'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default MarketList
