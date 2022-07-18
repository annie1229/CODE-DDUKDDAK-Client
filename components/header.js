import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from "next-auth/react"
import Image from 'next/image'
import { hasCookie } from 'cookies-next';
import styles from '../styles/components/header.module.scss';

export default function Header({ label, onClickBtn, isSignout=false }) {
  const router = useRouter();
  const { data, status } = useSession();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    if(hasCookie('uid')) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [isLogin]);

  useEffect(() => {
    console.log('change login status?????????', data, status);
    if(status === "authenticated") {
      
    }
  }, [data, status])

  const goToLobby = () => {
    router.push('/');
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

  return (
    <>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle} onClick={goToLobby}>{`{ CODE: ‘뚝딱’ }`}</div>
      </div>
      <div className={styles.headerRow}>
      {/* {
        isLogin
        ? <div className={styles.myPageBtn} onClick={onClickBtn}>{label}</div>
        : <div className={styles.loginBtn}  onClick={login}>
            <Image src="/github.png" alt="github Logo" width={20} height={20} />
            <div className={styles.loginText}>로그인</div>
          </div>
      } */}
      {
        // status === "authenticated"
        data
        ? <div className={styles.myPageBtn} onClick={isSignout ? signOut : onClickBtn}>{label}</div>
        : <div className={styles.loginBtn}  onClick={signIn}>
            <Image src="/github.png" alt="github Logo" width={20} height={20} />
            <div className={styles.loginText}>로그인</div>
          </div>
      }
      </div>
    </>
  )
}