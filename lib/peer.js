import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Peer from 'peerjs';
import { getCookie } from 'cookies-next';
import { socket } from './socket';
import styles from '../styles/pages/code.module.scss';

export default function Voice() {
  const router = useRouter();
  const [peerId, setPeerId] = useState('');
  const [voiceOff, setVoiceOff] = useState(false);
  const [remotePeerIdValue, setRemotePeerIdValue] = useState([]);
  const remoteVideoRef = useRef(null);
  // const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);

  useEffect(() => {
    const peer = new Peer();

    peer.on('open', (myPeerId) => {
      socket.emit('setPeerId', getCookie('uname'), myPeerId, router?.query?.roomId);
      console.log('[peer] set peer id >> ', myPeerId, router?.query?.roomId);
      setPeerId(myPeerId);
    });

    socket.on('getPeerId', (myPeerId, teamPeerIds) => {
      // teamPeerIds = [{gitId: peerId}]
      console.log('peer] get peer id', myPeerId, teamPeerIds);
      setRemotePeerIdValue(teamPeerIds);
    });

    peer.on('call', (call) => {
      let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      getUserMedia({ video: false, audio: true }, (mediaStream) => {
        // currentUserVideoRef.current.srcObject = mediaStream;
        // currentUserVideoRef.current.play();
        call.answer(mediaStream)
        call.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream
          remoteVideoRef.current.play();
        });
      });
    })

    peerInstance.current = peer;
  }, [])

  const call = (remotePeerId) => {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    getUserMedia({ video: false, audio: true }, (mediaStream) => {

      // currentUserVideoRef.current.srcObject = mediaStream;
      // currentUserVideoRef.current.play();

      const call = peerInstance.current.call(remotePeerId, mediaStream)

      call.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.play();
      });
    });
  }

  const voiceChat = () => {
    setVoiceOff(prevStatus => prevStatus ? false : true);
    console.log('voice on?', voiceOff, remotePeerIdValue);
    if (!voiceOff) {
      for (const [key, value] of Object.entries(remotePeerIdValue)) {
        if (key !== getCookie('uname')) {
          call(value);
        }
      }
    }
  };

  return (
    <div className={styles.voiceBtn} onClick={voiceChat}>
      팀보이스
      {/* <div style={{ display: 'none'}}>
        <video ref={currentUserVideoRef} />
      </div> */}
      <div style={{ display: 'none'}}>
        <video ref={remoteVideoRef} />
      </div>
    </div>
  );
}