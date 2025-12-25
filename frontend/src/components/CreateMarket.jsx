import React, { useEffect, useState } from 'react'
import { HiX, HiPlusCircle } from 'react-icons/hi'
import { openContractCall } from '@stacks/connect'
import { uintCV, stringUtf8CV, stringAsciiCV, PostConditionMode, makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions'
import toast from 'react-hot-toast'

import { CONFIG } from '../lib/config'
import { fetchStacksTipHeight } from '../lib/hiro'

const CreateMarket = ({ userData, userAddress, userSession, network, contractAddress, contractName, onClose, onConnect }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Crypto',
    resolutionSource: '',
    endDays: 30,
    initialLiquidity: 10
  })
  const [isLoading, setIsLoading] = useState(false)
  const [tipHeight, setTipHeight] = useState(null)
  const [isTipLoading, setIsTipLoading] = useState(true)
  const [tipError, setTipError] = useState(null)

  const categories = ['Crypto', 'Sports', 'Finance', 'Politics', 'Entertainment', 'Technology', 'Other']

  useEffect(() => {
    let cancelled = false
    async function loadTip() {
      setIsTipLoading(true)
      setTipError(null)
      try {
        const height = await fetchStacksTipHeight(CONFIG.hiroApiUrl)
        if (!cancelled) setTipHeight(height)
      } catch (e) {
        if (!cancelled) setTipError(e)
      } finally {
        if (!cancelled) setIsTipLoading(false)
      }
    }
    loadTip()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userData) { onConnect(); return }

    if (!userAddress) {
      toast.error('Wallet address not found. Reconnect your wallet and try again.')
      return
    }

    if (!userSession) {
      toast.error('Wallet session not initialized. Refresh and reconnect.')
      return
    }

    if (isTipLoading) {
      toast.error('Loading chain data—try again in a moment.')
      return
    }

    if (!tipHeight || typeof tipHeight !== 'number') {
      toast.error('Could not load chain data. Check your connection and try again.')
      return
    }
    
    if (!formData.title || formData.title.length < 10) {
      toast.error('Title must be at least 10 characters'); return
    }
    if (formData.initialLiquidity < 1) {
      toast.error('Minimum initial liquidity is 1 STX'); return
    }

    setIsLoading(true)
    try {
      const liquidityInMicroSTX = Math.floor(formData.initialLiquidity * 1000000)
      const blocksPerDay = 144
      const endTime = tipHeight + (formData.endDays * blocksPerDay)
      const resolutionTime = endTime + (7 * blocksPerDay)

      openContractCall({
        appDetails: {
          name: 'StacksBet Arena',
          icon: window.location.origin + '/logo.png',
        },
        network,
        stxAddress: userAddress,
        contractAddress,
        contractName,
        functionName: 'create-market',
        functionArgs: [
          stringUtf8CV(formData.title),
          stringUtf8CV(formData.description || 'No description provided'),
          stringAsciiCV(formData.category),
          stringUtf8CV(formData.resolutionSource || 'Manual resolution'),
          uintCV(endTime),
          uintCV(resolutionTime),
          uintCV(liquidityInMicroSTX)
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [makeStandardSTXPostCondition(userAddress, FungibleConditionCode.LessEqual, liquidityInMicroSTX)],
        userSession,
        onFinish: (data) => {
          console.log('Transaction finished:', data)
          setIsLoading(false)
          toast.success('Market created successfully!')
          onClose()
        },
        onCancel: () => {
          console.log('Transaction cancelled by user')
          setIsLoading(false)
          toast.error('Transaction cancelled')
        }
      })
    } catch (error) {
      console.error('Failed to create market:', error)
      setIsLoading(false)
      toast.error(`Failed to create market: ${error.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="glass-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-arena-purple/20 flex items-center justify-between">
          <h2 className="text-xl font-bold"><span className="gradient-text">Create Market</span></h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-arena-purple/20 transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Market Question *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Will BTC reach $100K by December 2025?"
              className="input-field w-full px-4 py-3 rounded-xl text-white"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional context about this prediction..."
              className="input-field w-full px-4 py-3 rounded-xl text-white resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field w-full px-4 py-3 rounded-xl text-white bg-arena-darker"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Resolution Source</label>
            <input
              type="text"
              value={formData.resolutionSource}
              onChange={(e) => setFormData({ ...formData, resolutionSource: e.target.value })}
              placeholder="e.g., CoinGecko, ESPN, Official announcement"
              className="input-field w-full px-4 py-3 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (days) *</label>
              <input
                type="number"
                value={formData.endDays}
                onChange={(e) => setFormData({ ...formData, endDays: parseInt(e.target.value) || 1 })}
                className="input-field w-full px-4 py-3 rounded-xl text-white"
                min={1}
                max={365}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Initial Liquidity (STX) *</label>
              <input
                type="number"
                value={formData.initialLiquidity}
                onChange={(e) => setFormData({ ...formData, initialLiquidity: parseFloat(e.target.value) || 1 })}
                className="input-field w-full px-4 py-3 rounded-xl text-white"
                min={1}
                step={0.1}
              />
            </div>
          </div>

          <div className="glass-card p-4 rounded-xl">
            <h4 className="font-medium mb-2">💡 Market Creator Benefits</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Earn 0.5% of all trading volume</li>
              <li>• Initial liquidity sets starting odds at 50/50</li>
              <li>• Resolution happens 7 days after market ends</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading || !tipHeight || !formData.title}
            className="w-full btn-primary py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="spinner w-5 h-5" />
            ) : isTipLoading ? (
              'Loading chain…'
            ) : tipError ? (
              'Chain unavailable'
            ) : (
              <><HiPlusCircle className="w-5 h-5" />Create Market ({formData.initialLiquidity} STX)</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateMarket
