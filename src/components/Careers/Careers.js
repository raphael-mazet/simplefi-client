import React, {useEffect, useRef} from 'react';
import './Careers.css';
import simpleFiCareers from '../../assets/images/simplefi-careers.svg';

export default function Careers ({setSplash}) {

  const communityLeadRef = useRef(null);

  useEffect(() => {
    setSplash(false)
  })

  function togglePosition (e, positionRef) {
    e.preventDefault();
    window.scrollTo(e.clientX, e.clientY);
    const position = positionRef.current.style;
    if (!position.display || position.display === 'none') {
      position.display = 'flex';
      position.animation = 'growDown 300ms ease-in-out forwards';
    } else {
      position.display = 'none';
    }
  }

  return (
    <div className='careers'>
      <div className='careers-info'>
        <div className="careers-main">
          <h2>Join the SimpleFi team!</h2>
          <h3>We're on a mission to make investing in DeFi as simple and intuitive as possible.{" "}
            <span>
              <a href = "mailto: development@simplefi.finance" target="_blank" rel="noreferrer">Join us</a>
            </span>
            !
          </h3>
          
          
        </div>
        <div className="careers-positions">
          <div className="positions-title">
            <h3>Open positions:</h3>
          </div>

          <button className='position-button' onClick={(e) => togglePosition(e, communityLeadRef)}>Community Lead</button>
          
          <div className="position-details" ref={communityLeadRef}>
            <button onClick={(e) => togglePosition(e, communityLeadRef)}>X</button>
            <h2>Community and Marketing Lead</h2>
            <h3>About SimpleFi</h3>
            <p>SimpleFi is a next-gen DeFi investment tool that shows users their ROI across all protocols and makes it simple for them to manage their portfolios.</p>
            <p>The project is VC-funded, recently won a bounty at ETHDenver 2021 and is the recipient of a Uniswap community grant.</p>
            <p>We are an equal opportunity employer and value diversity in our team. We welcome qualified candidates of all races, creeds, genders, age, and sexuality to apply.</p>
            <h3>What We’re Looking For</h3>
            <p>We are looking for a passionate DeFi-native to build a strong and healthy community for SimpleFi.</p>
            <p>You’re an active DeFi investor and highly connected to likeminded individuals across crypto twitter and other social channels.</p>
            <p>You believe, like us, that decentralized finance needs more simplicity to go truly mainstream. You care about the needs of other DeFiers and want to help them get the best user experience.</p>
            <h3>Responsibilities</h3>
            <ul>
              <li>Create and lead SimpleFi’s community strategy.</li>
              <li>Manage community social channels including live chat, blog posts and social media.</li>
              <li>Craft and deliver public content (presentations, posts, infographics, memes, etc.)</li>
              <li>Grow a healthy community and foster contributors to the ecosystem.</li>
              <li>Source feedback, ideas and actionable information from the community to improve SimpleFi.</li>
              <li>Attend and organize events (meetups, workshops, speaker, conference, hackathons and other speaking engagements)</li>
              <li>Promote third-party teams building with SimpleFi.</li>
            </ul>
            <h3>What you bring to the team</h3>
            <ul>
              <li>Experience with crypto community management, content management, marketing management, and engagement with users and developers.</li>
              <li>Excellent writing and communication skills across short and long-form media.</li>
              <li>Attention to detail and resourcefulness.</li>
              <li>DeFi knowledge and a great network of passionate DeFi believers.</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="careers-media">
        <img src={simpleFiCareers} alt="Welcome to SimpleFi" className="careers-media-image"/>
      </div>
    </div>
  )
}