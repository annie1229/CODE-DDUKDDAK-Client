import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import Image from 'next/image'
import styles from '../styles/components/header.module.scss';

export default function Header({ label, onClickBtn }) {
  const router = useRouter();
  const { data, status } = useSession();
  const [isValidUser, setIsValidUser] = useState(false);

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
    .then(data => {
      if(data.success) {
        setIsValidUser(true);
      }
    })
    .catch(error => console.log('error >> ', error));
  };

  return (
    <>
      <div className={styles.headerRow}>
        <div className={styles.headerTitle} onClick={goToLobby}>{`{ CODE: ‘뚝딱’ }`}</div>
      </div>
      <div className={styles.headerRow}>
      {
        isValidUser
        ? <div className={styles.myPageBtn} onClick={onClickBtn}>{label}</div>
        : status === 'loading'
          ? <div className={styles.myPageBtn}>로그인 중..</div>
          : <div className={styles.loginBtn}  onClick={signIn}>
              <Image src="/github.png" alt="github Logo" width={20} height={20} />
              <div className={styles.loginText}>로그인</div>
            </div>
      }
      </div>
    </>
  )
}