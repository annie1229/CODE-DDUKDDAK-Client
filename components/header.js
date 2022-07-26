import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react';
import { hasCookie, deleteCookie } from 'cookies-next';
import { socket } from '../lib/socket';
import Loading from './loading';
import styles from '../styles/components/header.module.scss';

export default function Header({ label="", onClickBtn=()=>{}, checkValidUser=()=>{}, isCustom=false, customHeader=null }) {
  const router = useRouter();
  const { data, status } = useSession();
  const [isValidUser, setIsValidUser] = useState(false);

  useEffect(() => {
    if(status === 'authenticated') {
      console.log('data', data);
      if(hasCookie('nodeId')) {
        checkValidUser(true);
        setIsValidUser(true);
        if (router.isReady) {
          socket.emit('setGitId', data?.gitId, data?.avatarUrl, router?.query?.mode, router?.query?.roomId);
        }
      } else {
        if(data.accessToken) {
          console.log('data accesstoken header', data.accessToken);
          sendAccessToken(data.accessToken);
        }
      }
    } else if(status === 'unauthenticated') {
      deleteCookies();
    }
  }, [status, data, router.isReady]);

  const deleteCookies = () => {
    deleteCookie('nodeId');
    deleteCookie('gitId');
    deleteCookie('avatarUrl');
    checkValidUser(false);
    setIsValidUser(false);
  };

  const goToLobby = () => {
    router.replace('/');
  };

  const sendAccessToken = async(accessToken) => {
    await fetch(`/server/api/user/get-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken
      })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        checkValidUser(true);
        setIsValidUser(true);
        if (router.isReady) {
          socket.emit('setGitId', data?.gitId, data?.avatarUrl, router?.query?.mode, router?.query?.roomId);
        }
      } else {
        deleteCookies();
        signOut();
      }
    })
    .catch(error => {
      console.log('[/components/header] get-info error >> ', error);
      deleteCookies();
      signOut();
    });
  };

  return (
    <>
      { status === 'loading' && <Loading /> }
      {
        isCustom
        ? customHeader
        : <>
            <div className={styles.headerRow}>
              <div className={styles.headerTitle} onClick={goToLobby}>{`{ CODE: '뚝딱' }`}</div>
            </div>
            <div className={styles.headerRow}>
            {
              isValidUser
              ? <div className={styles.myPageBtn} onClick={onClickBtn}>{label}</div>
              : <div className={styles.loginBtn}  onClick={() => signIn('github')}>
                  <Image src="/github.png" alt="github Logo" width={20} height={20} />
                  <div className={styles.loginText}>로그인</div>
                </div>
            }
            </div>
          </>
      }
    </>
  )
}