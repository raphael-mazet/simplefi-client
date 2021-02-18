import React, {useEffect, useState} from 'react';
import './InfoModal.css';

export default function InfoModal({content, contentRef}) {
  
  const [modalContent, setModalContent] = useState(<></>);

  useEffect (() => {
    if (content === 'about') {
      setModalContent (
        <p>
          SimpleFi is a free and open source tool for managing decentralised financial investments.{'\n'}
          {'\n'}
          A list of supported protocols is available on
          <a href="https://github.com/raphael-mazet/simplefi-client/blob/master/README.md" target="blank"> github</a>.
        </p>
      )
    } else if (content === '😊') {
      setModalContent (
        <p>
          😊
          {'\n'}
          Please tell us what you think about SimpleFi! Contact the team on our
          <a href="https://t.me/joinchat/H0UceruS5m_MZeB9" target="blank"> Telegram group </a>
          or DM us on
          <a href="https://twitter.com/simplefi_" target="blank"> Twitter</a>.
        </p>
      )
    }
  }, [content])

  return (
    <div ref={contentRef} className="info-modal">
      {modalContent}
    </div>
  );
}
