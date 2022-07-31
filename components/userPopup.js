import { useState, useEffect } from 'react';
import Image from 'next/image'
import { hasCookie, getCookie, setCookie } from 'cookies-next';
import { socket } from '../lib/socket';
import styles from '../styles/components/userPopup.module.scss';
import { PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function UserPopup({ userId, onClick }) {
  const [info, setInfo] = useState({});
  const [myFollowing, setMyFollowing] = useState([]);
  const [isFollow, setIsFollow] = useState(false);
  const [userGameLog, setUserGameLog] = useState('');
  const [userLangData, setUserLangData] = useState('');
  const LangArr = []

  useEffect(() => {
    if (userId) {
      getUserInfo();
    }
  }, [userId]);

  useEffect(() => {
    if (!hasCookie('following')) {
      getMyInfo();
    } else {
      setMyFollowing(JSON.parse(getCookie('following')));
    }
  }, []);

  useEffect(() => {
    if (myFollowing.length) {
      setCookie('following', JSON.stringify(myFollowing));
    }
  }, [myFollowing]);

  useEffect(() => {
    myFollowing?.map(userId => {
      if (userId === info._id) {
        setIsFollow(true);
      }
    });
  }, [myFollowing, info]);

  useEffect(() => {
    socket.emit('getFollowingList');
  }, [isFollow]);

  const getRankName = (rank, ranking) => {
    let myrank = 'Bronze';
    switch (rank) {
      case 0:
        myrank = 'Bronze';
        break;
      case 1:
        myrank = 'Silver';
        break;
      case 2:
        myrank = 'Gold';
        break;
      case 3:
        myrank = 'Platinum';
        break;
      case 4:
        myrank = 'Diamond';
        break;
      case 5:
        myrank = 'Master';
        break;
    }
    if (ranking === 1) {
      myrank = 'King';
    }
    return myrank;
  };

  const getRankImg = (rank, ranking) => {
    let imgUrl = '/rank/rank0.png';
    switch (rank) {
      case 0:
        imgUrl = '/rank/rank0.png';
        break;
      case 1:
        imgUrl = '/rank/rank1.png';
        break;
      case 2:
        imgUrl = '/rank/rank2.png';
        break;
      case 3:
        imgUrl = '/rank/rank3.png';
        break;
      case 4:
        imgUrl = '/rank/rank4.png';
        break;
      case 5:
        imgUrl = '/rank/rank5.png';
        break;
    }
    if (ranking == 1) {
      imgUrl = '/rank/king.png';
    }
    return imgUrl;
  };

  const getMyInfo = async () => {
    await fetch(`/server/api/user/getMyInfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        setCookie('following', JSON.stringify(data.UserInfo.following));
        setMyFollowing(data.UserInfo.following);
      }
    })
    .catch(error => console.log('[/component/userPopup] getMyInfo error >> ', error));
  };

  const getUserInfo = async () => {
    await fetch(`/server/api/user/getUserInfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId
      })
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        const langInfo = data.UserInfo.language
          const langLength = Object.keys(langInfo).length
          const langKey = Object.keys(langInfo)
          const langValue = Object.values(langInfo)

          setInfo(data.UserInfo);
          for (let i = 0; i < langLength; i++) {
            LangArr.push({ name: langKey[i], value: langValue[i] })
          }

          setUserLangData(LangArr)
      }
    })
    .catch(error => console.log('[/component/userPopup] getUserInfo error >> ', error));
  };

  const onClickFollow = () => {
    socket.emit('followMember', info._id);
    setMyFollowing(prev => [...prev, info._id]);
    setIsFollow(true);
  };

  const onClickUnFollow = () => {
    socket.emit('unFollowMember', info._id);
    setMyFollowing(prev => prev.filter(userId => userId !== info._id));
    setIsFollow(false);
  };



  // Chart

  const COLORS = ["#326e9e", "#e2d14a", "#5f92c6", "#f37821"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text className={styles.rechartsFontSize} x={x} y={y} fill="white" textAnchor={'middle'} dominantBaseline="central">
        {percent === 0 ? null : `${userLangData[index]["name"]} ${(percent * 100).toFixed(0)}%`
        }
      </text >
    );
  };

  const Chart = ({ data }) => {
    const dataLeng = Object.keys(data).length
    const colorsLeng = Object.keys(COLORS).length
    return (
      <>
        <ResponsiveContainer width="31%" height="140%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={40}
              outerRadius={55}
              fill="#8884d8"
              dataKey="value"
            >
              {data && data?.map((entry, index) => (
                < Cell key={`cell-${index}`} fill={dataLeng > colorsLeng ? '#8884d8' : COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </>
    )
  }

  // Chart

  return (
    <div className={styles.popupBackground}>
    {
      info.gitId
      && <div className={styles.infoTab}>
          <div className={styles.myProfileBox}>
            <div className={styles.gameHistoryHeader}>
              <div className={styles.myProfileTitle}>내 정보</div>
              {       
                isFollow
                ? <div className={styles.inviteBtnClicked} onClick={onClickUnFollow}>언팔로우</div>
                : <div className={styles.inviteBtn} onClick={onClickFollow}>팔로우</div>
              }
            </div>
            <div className={styles.myProfileBody}>
              <div className={styles.myInfoRow}>
                <div className={styles.myProfileIcon}>
                  <Image src={info.avatarUrl ?? '/default_profile.jpg'} width={80} height={80} className={styles.myProfileIcon} alt="프로필이미지" />
                  <div className={styles.myRank}>
                    <Image src={getRankImg(info.rank, info.ranking)} width={30} height={30} className={styles.rankIcon} alt="프로필이미지" />
                  </div>
                </div>
                <div className={styles.myInfoCol}>
                  <div className={styles.nickname}>{info?.gitId ?? ''}</div>
                  <div className={styles.rankBox}>
                    <div className={styles.fieldTitle}>{getRankName(info?.rank, info?.ranking)}</div>
                    <div className={styles.pointText}>{`${info?.totalScore ?? 0 * 5} Point`}</div>
                  </div>
                </div>
              </div>
              <div className={styles.splitterHorizontal} />
              <div className={styles.myInfoRow}>
                <div className={styles.myInfoCol}>
                  <div className={styles.fieldTitle}>랭킹</div>
                  <div className={styles.percentText}>{`${info?.ranking ?? 0}등 (상위 ${info?.rankingPercent ?? 100}%)`}</div>
                </div>
                <div className={styles.splitterVertical} />
                <div className={styles.myInfoCol}>
                  <div className={styles.fieldTitle}>사용 언어</div>
                  <div className={styles.percentText}>{info?.mostLanguage ? info?.mostLanguage : '-'}</div>
                </div>
                <div className={styles.splitterVertical} />
                <Chart data={userLangData} />
              </div>
              <div className={styles.splitterHorizontal} />
              <div className={styles.myInfoRow}>
                <div className={styles.myInfoCol}>
                  <div className={styles.fieldTitle}>평균 통과율</div>
                  <div className={styles.percentText}>{`${info?.totalPassRate ? parseInt(info?.totalPassRate / (info?.totalSolo + info?.totalTeam)) : 0}%`}</div>
                </div>
                <div className={styles.splitterVertical} />
                <div className={styles.myInfoCol}>
                  <div className={styles.fieldTitle}>Solo 승률</div>
                  <div className={styles.percentText}>{`${info?.winSolo ? parseInt(info?.winSolo / info?.totalSolo * 100) : 0}%`}</div>
                </div>
                <div className={styles.splitterVertical} />
                <div className={styles.myInfoCol}>
                  <div className={styles.fieldTitle}>Team 승률</div>
                  <div className={styles.percentText}>{`${info?.winTeam ? parseInt(info?.winTeam / info?.totalTeam * 100) : 0}%`}</div>
                </div>
              </div>
              <div className={styles.splitterHorizontal} />
              <div className={styles.myInfoFooter}>
                <div className={styles.inviteBtn} onClick={onClick}>닫기</div>
              </div>
            </div>
          </div>
        </div>
    }
    </div>
  )
}