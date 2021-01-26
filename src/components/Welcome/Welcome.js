import React, { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import simpleFiSplash from '../../assets/images/simpleFi-splash-blue-sun.svg';
import simpleFiLogo from '../../assets/logos/simplefi-logotype.svg';
import './Welcome.css';
import { connectWallet } from '../../authentication/web3';
import { useHistory } from 'react-router-dom';

export default function Welcome ({setUserAccount, userAccount, setSplash}) {

  const [accountValue, setAccountValue] = useState('');
  const history = useHistory();
  const accountFormRef = useRef(null);

  function toggleForm(e, ref) {
    e.preventDefault();
    const form = ref.current.style;
    const button = e.target.classList;
    if (form?.display === '' || form?.display === 'none') {
      form.display = 'block';
      form.animation = 'growDown 300ms ease-in-out forwards';
      button.add('visible-add-account');
      button.remove('invisible-add-account');
    } else {
      form.animation = 'shrinkUp 300ms ease-in-out forwards';
      setTimeout(() => form.display = 'none', 300);
      button.remove('visible-add-account');
      button.add('invisible-add-account');
    }
  }

  function handleChange(e) {
    setAccountValue(e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (ethers.utils.isAddress(accountValue)) {
      setUserAccount([accountValue]);
      history.push('/dashboard');
    } else {
      alert('Please enter a valid Ethereum address')
    }
  }

  useEffect(() => {
    setSplash(false);
    return () => setSplash(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  })

  return (
    <div className='welcome'>
      <div className='welcome-splash'>
        <div className="splash-main">
          <div className="splash-image">
            <img src={simpleFiLogo} alt='simpleFi logo' className="welcome-splash-image" />
          </div>
          <h2>Making decentralized finance accessible to everyone</h2>
        </div>
        <div className="splash-connect">
            <button className='welcome-button' onClick={() => connectWallet(setUserAccount, history, userAccount)}>{userAccount[0] ? 'View dashboard' : 'Connect wallet'}</button>
            <button className='alt-connect-button' onClick={(e) => toggleForm(e, accountFormRef)}>or check address</button>
            <form ref={accountFormRef} type="text" value={accountValue} onSubmit={handleSubmit}>
              <label>
                Name:
                <input type="text" name="name" onChange={handleChange}/>
              </label>
              <input type="submit" value="Submit" />
            </form>
        </div>
      </div>
      <div className="welcome-media">
        <img src={simpleFiSplash} alt="Welcome to SimpleFi" className="welcome-media-image"/>
      </div>
    </div>
  )
}