import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from "next-auth/react"
import Image from 'next/image'
import { setCookie, deleteCookie } from 'cookies-next';
import styles from '../styles/components/header.module.scss';

export default function Header({ label, onClickBtn, isSignout=false }) {
  const router = useRouter();
  const { data, status } = useSession();

  useEffect(() => {
    console.log('change login status?????????', data, status);
    if(status === "authenticated") {
      sendAccessToken(data.accessToken);
    }
  }, [status])

  const goToLobby = () => {
    router.push('/');
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
    .then(data => console.log('success get info user'))
    .catch(error => console.log('error >> ', error));
  };

  const login = async() => {
    await fetch(`/login`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include' 
    })
    .then(res => res.json())
    .then(data => router.push(data.url))
    .catch(error => console.log('error >> ', error));
  };

  const logout = async() => {
    deleteCookie('uid');
    deleteCookie('uname');
    deleteCookie('uimg');
    signOut();
    goToLobby();
  }

  return (
    <>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle} onClick={goToLobby}>{`{ CODE: ‘뚝딱’ }`}</div>
      </div>
      <div className={styles.headerRow}>
      {
        // status === "authenticated"
        data
        ? <div className={styles.myPageBtn} onClick={isSignout ? logout : onClickBtn}>{label}</div>
        : <div className={styles.loginBtn}  onClick={signIn}>
            <Image src="/github.png" alt="github Logo" width={20} height={20} />
            <div className={styles.loginText}>로그인</div>
          </div>
      }
      </div>
    </>
  )
}