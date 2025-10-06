import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import BlindDealABI from './BlindDeal.json'
import './App.css'

const CONTRACT_ADDRESS = "0x23Fa3906D3102d4ceb1ef6143aC7A998E7F42004"

function App() {
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [deals, setDeals] = useState([])
  
  // Form states
  const [itemName, setItemName] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [secret, setSecret] = useState('')
  const [dealId, setDealId] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [revealDealId, setRevealDealId] = useState('')
  const [revealPriceValue, setRevealPriceValue] = useState('')
  const [revealSecret, setRevealSecret] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!')
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        BlindDealABI.abi,
        signer
      )
      
      setAccount(address)
      setContract(contractInstance)
      setMessage('✅ Wallet connected!')
      
      loadDeals(contractInstance)
    } catch (error) {
      console.error(error)
      setMessage('❌ Failed to connect wallet')
    }
  }

  // Load all deals
  const loadDeals = async (contractInstance) => {
    try {
      const dealCount = await contractInstance.dealCount()
      const dealsArray = []
      
      for (let i = 0; i < dealCount; i++) {
        const deal = await contractInstance.getDeal(i)
        dealsArray.push({
          id: i,
          seller: deal[0],
          buyer: deal[1],
          itemName: deal[2],
          sellerCommitted: deal[3],
          buyerCommitted: deal[4],
          sellerRevealed: deal[5],
          buyerRevealed: deal[6],
          dealCompleted: deal[7],
          dealMatched: deal[8]
        })
      }
      
      setDeals(dealsArray)
    } catch (error) {
      console.error(error)
    }
  }

  // Create deal (Seller)
  const createDeal = async () => {
    if (!itemName || !minPrice || !secret) {
      setMessage('❌ Please fill all fields')
      return
    }
    
    try {
      setLoading(true)
      setMessage('⏳ Creating deal...')
      
      const secretBytes = ethers.id(secret)
      const tx = await contract.createDeal(itemName, minPrice, secretBytes)
      await tx.wait()
      
      setMessage('✅ Deal created successfully!')
      setItemName('')
      setMinPrice('')
      setSecret('')
      loadDeals(contract)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setMessage('❌ Failed to create deal')
      setLoading(false)
    }
  }

  // Make offer (Buyer)
  const makeOffer = async () => {
    if (!dealId || !offerPrice || !secret) {
      setMessage('❌ Please fill all fields')
      return
    }
    
    try {
      setLoading(true)
      setMessage('⏳ Making offer...')
      
      const secretBytes = ethers.id(secret)
      const tx = await contract.makeOffer(dealId, offerPrice, secretBytes)
      await tx.wait()
      
      setMessage('✅ Offer made successfully!')
      setDealId('')
      setOfferPrice('')
      setSecret('')
      loadDeals(contract)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setMessage('❌ Failed to make offer')
      setLoading(false)
    }
  }

  // Reveal price
  const handleRevealPrice = async (isSeller) => {
    if (!revealDealId || !revealPriceValue || !revealSecret) {
      setMessage('❌ Please fill all fields')
      return
    }
    
    try {
      setLoading(true)
      setMessage('⏳ Revealing price...')
      
      const secretBytes = ethers.id(revealSecret)
      const tx = isSeller 
        ? await contract.revealMinPrice(revealDealId, revealPriceValue, secretBytes)
        : await contract.revealOfferPrice(revealDealId, revealPriceValue, secretBytes)
      await tx.wait()
      
      setMessage('✅ Price revealed!')
      setRevealDealId('')
      setRevealPriceValue('')
      setRevealSecret('')
      loadDeals(contract)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setMessage('❌ Failed to reveal price')
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header>
        <h1>🤝 Blind Deal</h1>
        <p>Encrypted Price Negotiation using FHEVM</p>
        {!account ? (
          <button onClick={connectWallet} className="connect-btn">
            Connect Wallet
          </button>
        ) : (
          <div className="account-info">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
      </header>

      {message && <div className="message">{message}</div>}

      {account && (
        <div className="container">
          {/* Seller Section */}
          <div className="card">
            <h2>🏷️ Create Deal (Seller)</h2>
            <input
              type="text"
              placeholder="Item Name (e.g., iPhone 15)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Minimum Price (Wei)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="text"
              placeholder="Secret (remember this!)"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
            <button onClick={createDeal} disabled={loading}>
              Create Deal
            </button>
          </div>

          {/* Buyer Section */}
          <div className="card">
            <h2>💰 Make Offer (Buyer)</h2>
            <input
              type="number"
              placeholder="Deal ID"
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
            />
            <input
              type="number"
              placeholder="Offer Price (Wei)"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
            />
            <input
              type="text"
              placeholder="Secret (remember this!)"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
            <button onClick={makeOffer} disabled={loading}>
              Make Offer
            </button>
          </div>

          {/* Reveal Section */}
          <div className="card">
            <h2>🔓 Reveal Price</h2>
            <input
              type="number"
              placeholder="Deal ID"
              value={revealDealId}
              onChange={(e) => setRevealDealId(e.target.value)}
            />
            <input
              type="number"
              placeholder="Your Price"
              value={revealPriceValue}
              onChange={(e) => setRevealPriceValue(e.target.value)}
            />
            <input
              type="text"
              placeholder="Your Secret"
              value={revealSecret}
              onChange={(e) => setRevealSecret(e.target.value)}
            />
            <div className="btn-group">
              <button onClick={() => handleRevealPrice(true)} disabled={loading}>
                Reveal as Seller
              </button>
              <button onClick={() => handleRevealPrice(false)} disabled={loading}>
                Reveal as Buyer
              </button>
            </div>
          </div>

          {/* Deals List */}
          <div className="deals-section">
            <h2>📋 All Deals</h2>
            {deals.length === 0 ? (
              <p>No deals yet. Create the first one!</p>
            ) : (
              deals.map((deal) => (
                <div key={deal.id} className="deal-card">
                  <h3>Deal #{deal.id}: {deal.itemName}</h3>
                  <p><strong>Seller:</strong> {deal.seller.slice(0, 10)}...</p>
                  <p><strong>Buyer:</strong> {deal.buyer === ethers.ZeroAddress ? 'Waiting...' : deal.buyer.slice(0, 10) + '...'}</p>
                  <div className="status">
                    <span className={deal.sellerCommitted ? 'badge-green' : 'badge-gray'}>
                      {deal.sellerCommitted ? '✓ Seller Committed' : '○ Seller Pending'}
                    </span>
                    <span className={deal.buyerCommitted ? 'badge-green' : 'badge-gray'}>
                      {deal.buyerCommitted ? '✓ Buyer Committed' : '○ Buyer Pending'}
                    </span>
                  </div>
                  <div className="status">
                    <span className={deal.sellerRevealed ? 'badge-blue' : 'badge-gray'}>
                      {deal.sellerRevealed ? '✓ Seller Revealed' : '○ Seller Not Revealed'}
                    </span>
                    <span className={deal.buyerRevealed ? 'badge-blue' : 'badge-gray'}>
                      {deal.buyerRevealed ? '✓ Buyer Revealed' : '○ Buyer Not Revealed'}
                    </span>
                  </div>
                  {deal.dealCompleted && (
                    <div className={`result ${deal.dealMatched ? 'matched' : 'not-matched'}`}>
                      {deal.dealMatched ? '🎉 DEAL MATCHED!' : '❌ Deal Not Matched'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App