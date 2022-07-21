import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { getCookie } from 'cookies-next';
import { socket } from '../../lib/socket';
import styles from '../../styles/components/friend.module.scss';

export default function FriendItem({ user, isOnline, onClick }) {
  const router = useRouter();  
  const [isClick, setIsClick] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    socket.on('sendChatMessage', message => {
      if (message['senderId'] === user.gitId) {
        setMessageCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('sendChatMessage');
    };
  })
  const onClickInvite = () => {
    if(isClick === false) {
      socket.emit('inviteMember', { gitId: getCookie('gitId'), avatarUrl: getCookie('avatarUrl') }, user.gitId);
      setIsClick(true);
    }
  };

  return (
    <div className={styles.friendElem} key={user.gitId}>
      <div className={styles.connectInfo}>
        <Image src={isOnline ? '/online.png' : '/offline.png'} alt="online" width={10} height={10} />
      </div>
      <div className={styles.friendNickname} onClick={() => onClick(user.gitId)}>{user.gitId}</div>
      {
        router?.route === '/code/wait' && router?.query?.mode === 'team'
        ? isOnline
          ? <div className={isClick ? styles.inviteBtnClicked : styles.inviteBtn} onClick={onClickInvite}>초대</div>
          : <div className={styles.inviteBtnDisable}>초대</div>
        : <div className={styles.messageBadge}>{messageCount}</div>
      }
    </div>
  )
}