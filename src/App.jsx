import { useState } from 'react'
import { ethers } from 'ethers'
import BlindDealABI from './BlindDeal.json'

const CONTRACT_ADDRESS = "0x23Fa3906D3102d4ceb1ef6143aC7A998E7F42004"

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #5b21b6 0%, #4c1d95 50%, #1e3a8a 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  hero: {
    textAlign: 'center',
    padding: '60px 20px',
    position: 'relative',
  },
  title: {
    fontSize: '4rem',
    fontWeight: '800',
    background: 'linear-gradient(to right, #c084fc, #f9a8d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '20px',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#ddd6fe',
    marginBottom: '30px',
  },
  connectBtn: {
    padding: '16px 40px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(147, 51, 234, 0.3)',
    transition: 'transform 0.3s',
  },
  accountBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  greenDot: {
    width: '12px',
    height: '12px',
    background: '#4ade80',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  message: {
    maxWidth: '1200px',
    margin: '0 auto 30px',
    padding: '16px',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    textAlign: 'center',
    fontWeight: '600',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    maxWidth: '1200px',
    margin: '0 auto 30px',
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    padding: '16px',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  activeTab: {
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    color: 'white',
  },
  inactiveTab: {
    background: 'transparent',
    color: '#ddd6fe',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '14px',
    marginBottom: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(to right, #9333ea, #ec4899)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },
  dealCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginBottom: '16px',
    transition: 'transform 0.3s',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginRight: '8px',
    marginTop: '8px',
  },
}

function App() {
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [deals, setDeals] = useState([])
  const [activeTab, setActiveTab] = useState('create')
  const [itemName, setItemName] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [secret, setSecret] = useState('')
  const [dealId, setDealId] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [revealDealId, setRevealDealId] = useState('')
  const [revealPriceValue, setRevealPriceValue] = useState('')
  const [revealSecret, setRevealSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

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
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, BlindDealABI.abi, signer)
      setAccount(address)
      setContract(contractInstance)
      setMessage({ text: 'Wallet connected!', type: 'success' })
      loadDeals(contractInstance)
    } catch (error) {
      setMessage({ text: 'Failed to connect wallet', type: 'error' })
    }
  }

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

  const createDeal = async () => {
    if (!itemName || !minPrice || !secret) {
      setMessage({ text: 'Please fill all fields', type: 'error' })
      return
    }
    try {
      setLoading(true)
      setMessage({ text: 'Creating deal...', type: 'info' })
      const secretBytes = ethers.id(secret)
      const minPriceWei = ethers.parseEther(minPrice)
      const tx = await contract.createDeal(itemName, minPriceWei, secretBytes)
      await tx.wait()
      setMessage({ text: 'Deal created!', type: 'success' })
      setItemName('')
      setMinPrice('')
      setSecret('')
      loadDeals(contract)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setMessage({ text: 'Failed to create deal', type: 'error' })
      setLoading(false)
    }
  }

  const makeOffer = async () => {
    if (!dealId || !offerPrice || !secret) {
      setMessage({ text: 'Please fill all fields', type: 'error' })
      return
    }
    try {
      setLoading(true)
      setMessage({ text: 'Making offer...', type: 'info' })
      const secretBytes = ethers.id(secret)
      const offerPriceWei = ethers.parseEther(offerPrice)
      const tx = await contract.makeOffer(dealId, offerPriceWei, secretBytes)
      await tx.wait()
      setMessage({ text: 'Offer made!', type: 'success' })
      setDealId('')
      setOfferPrice('')
      setSecret('')
      loadDeals(contract)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setMessage({ text: 'Failed to make offer', type: 'error' })
      setLoading(false)
    }
  }

  const handleRevealPrice = async (isSeller) => {
    if (!revealDealId || !revealPriceValue || !revealSecret) {
      setMessage({ text: 'Please fill all fields', type: 'error' })
      return
    }
    try {
      setLoading(true)
      setMessage({ text: 'Revealing...', type: 'info' })
      const secretBytes = ethers.id(revealSecret)
      const priceWei = ethers.parseEther(revealPriceValue)
      const tx = isSeller 
        ? await contract.revealMinPrice(revealDealId, priceWei, secretBytes)
        : await contract.revealOfferPrice(revealDealId, priceWei, secretBytes)
      await tx.wait()
      setMessage({ text: 'Price revealed!', type: 'success' })
      setRevealDealId('')
      setRevealPriceValue('')
      setRevealSecret('')
      loadDeals(contract)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setMessage({ text: 'Failed to reveal', type: 'error' })
      setLoading(false)
    }
  }

  const messageStyle = {
    ...styles.message,
    background: message.type === 'success' ? 'rgba(74, 222, 128, 0.2)' : 
                message.type === 'error' ? 'rgba(248, 113, 113, 0.2)' : 
                'rgba(96, 165, 250, 0.2)',
    border: `1px solid ${message.type === 'success' ? '#4ade80' : 
                         message.type === 'error' ? '#f87171' : '#60a5fa'}`,
    color: message.type === 'success' ? '#bbf7d0' : 
           message.type === 'error' ? '#fecaca' : '#bfdbfe',
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Blind Deal</h1>
        <p style={styles.subtitle}>Encrypted Price Negotiation using FHEVM</p>
        {!account ? (
          <button 
            style={styles.connectBtn}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        ) : (
          <div style={styles.accountBox}>
            <div style={styles.greenDot}></div>
            <span style={{color: 'white', fontWeight: '600'}}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
        )}
      </div>

      {message.text && (
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
          <div style={messageStyle}>{message.text}</div>
        </div>
      )}

      {account && (
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
          <div style={styles.tabs}>
            {['create', 'offer', 'reveal'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab ? styles.activeTab : styles.inactiveTab)
                }}
              >
                {tab === 'create' && 'Create Deal'}
                {tab === 'offer' && 'Make Offer'}
                {tab === 'reveal' && 'Reveal Price'}
              </button>
            ))}
          </div>

          {activeTab === 'create' && (
            <div style={styles.card}>
              <h2 style={{color: 'white', marginBottom: '24px'}}>Create New Deal</h2>
              <input
                type="text"
                placeholder="Item Name (e.g., iPhone 15 Pro)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Minimum Price (ETH)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={styles.input}
                step="0.001"
              />
              <input
                type="password"
                placeholder="Secret (remember this!)"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                style={styles.input}
              />
              <button 
                onClick={createDeal} 
                disabled={loading}
                style={{...styles.button, opacity: loading ? 0.5 : 1}}
                onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                {loading ? 'Creating...' : 'Create Deal'}
              </button>
            </div>
          )}

          {activeTab === 'offer' && (
            <div style={styles.card}>
              <h2 style={{color: 'white', marginBottom: '24px'}}>Make an Offer</h2>
              <input
                type="number"
                placeholder="Deal ID"
                value={dealId}
                onChange={(e) => setDealId(e.target.value)}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Offer Price (ETH)"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                style={styles.input}
                step="0.001"
              />
              <input
                type="password"
                placeholder="Secret (remember this!)"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                style={styles.input}
              />
              <button 
                onClick={makeOffer} 
                disabled={loading}
                style={{...styles.button, opacity: loading ? 0.5 : 1}}
              >
                {loading ? 'Submitting...' : 'Make Offer'}
              </button>
            </div>
          )}

          {activeTab === 'reveal' && (
            <div style={styles.card}>
              <h2 style={{color: 'white', marginBottom: '24px'}}>Reveal Your Price</h2>
              <input
                type="number"
                placeholder="Deal ID"
                value={revealDealId}
                onChange={(e) => setRevealDealId(e.target.value)}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Your Price (ETH)"
                value={revealPriceValue}
                onChange={(e) => setRevealPriceValue(e.target.value)}
                style={styles.input}
                step="0.001"
              />
              <input
                type="password"
                placeholder="Your Secret"
                value={revealSecret}
                onChange={(e) => setRevealSecret(e.target.value)}
                style={styles.input}
              />
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                <button 
                  onClick={() => handleRevealPrice(true)} 
                  disabled={loading}
                  style={styles.button}
                >
                  Reveal as Seller
                </button>
                <button 
                  onClick={() => handleRevealPrice(false)} 
                  disabled={loading}
                  style={{...styles.button, background: 'linear-gradient(to right, #2563eb, #06b6d4)'}}
                >
                  Reveal as Buyer
                </button>
              </div>
            </div>
          )}

          <h2 style={{color: 'white', marginTop: '40px', marginBottom: '20px'}}>All Deals</h2>
          {deals.length === 0 ? (
            <div style={{...styles.card, textAlign: 'center', color: '#ddd6fe'}}>
              No deals yet. Create the first one!
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
              {deals.map(deal => (
                <div key={deal.id} style={styles.dealCard}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <h3 style={{color: 'white'}}>Deal #{deal.id}</h3>
                    {deal.dealCompleted && (
                      <span style={{
                        ...styles.badge,
                        background: deal.dealMatched ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                        color: deal.dealMatched ? '#4ade80' : '#f87171',
                      }}>
                        {deal.dealMatched ? 'Matched' : 'Failed'}
                      </span>
                    )}
                  </div>
                  <p style={{color: '#ddd6fe', fontSize: '1.1rem', marginBottom: '16px'}}>{deal.itemName}</p>
                  <div style={{fontSize: '0.9rem', color: '#c4b5fd', marginBottom: '12px'}}>
                    <div>Seller: {deal.seller.slice(0, 10)}...</div>
                    <div>Buyer: {deal.buyer === ethers.ZeroAddress ? 'Waiting...' : deal.buyer.slice(0, 10) + '...'}</div>
                  </div>
                  <div>
                    <span style={{
                      ...styles.badge,
                      background: deal.sellerCommitted ? 'rgba(74, 222, 128, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                      color: deal.sellerCommitted ? '#4ade80' : '#9ca3af',
                    }}>
                      Seller {deal.sellerCommitted ? '✓' : '○'}
                    </span>
                    <span style={{
                      ...styles.badge,
                      background: deal.buyerCommitted ? 'rgba(74, 222, 128, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                      color: deal.buyerCommitted ? '#4ade80' : '#9ca3af',
                    }}>
                      Buyer {deal.buyerCommitted ? '✓' : '○'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <footer style={{textAlign: 'center', padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '60px'}}>
        <p style={{color: '#ddd6fe'}}>Built with FHEVM Technology • Secured by Blockchain</p>
      </footer>
    </div>
  )
}

export default App