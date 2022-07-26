import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { socket } from '../../lib/socket';
import styles from '../../styles/components/friend.module.scss';

export default function FriendItem({ user, isOnline, onClick, isInvite }) {
  const router = useRouter();  
  const { data } = useSession();
  const [isClick, setIsClick] = useState(isInvite);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    socket.emit('getUnreadMessage', user.gitId, data?.gitId);

    socket.on('unreadMessage', message => {
      if (message['senderId'] === user.gitId) {
        setMessageCount(message['count']);
      }
    });

    return () => {
      socket.off('unreadMessage');
      socket.off('getUnreadMessage');
    };
  }, []);

  const onClickInvite = () => {
    if(isClick === false) {
      socket.emit('inviteMember', { gitId: data?.gitId, avatarUrl: data?.avatarUrl }, user.gitId);
      setIsClick(true);
    }
  };

  return (
    <div className={styles.friendElem}>
      <div className={styles.connectInfo}>
        <Image src={isOnline ? '/online.png' : '/offline.png'} alt="online" width={10} height={10} />
      </div>
      <div className={styles.friendNickname} onClick={() => onClick(user.gitId)}>{user.gitId}</div>
      {
        router?.route === '/code/wait' && router?.query?.mode === 'team'
        ? isOnline
          ? <div className={isClick ? styles.inviteBtnClicked : styles.inviteBtn} onClick={onClickInvite}>초대</div>
          : <div className={styles.inviteBtnDisable}>초대</div>
        : <div className={messageCount ? styles.messageBadge : styles.hidden}>{messageCount}</div>
      }
    </div>
  )
}