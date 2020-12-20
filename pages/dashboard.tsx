import { useEffect, FC, useState } from 'react'
// 関数コンポーネントからrouterにアクセスするために必要
import { useRouter } from 'next/router'
import firebase from 'firebase/app'

import { auth } from '../utils/firebase'
import Header from '../components/header'

/**
 * ユーザー情報
 */
type User = {
  name: string
}

const Dashboard: FC = () => {
  const router = useRouter()
  // ステートフック
  // currentUserステートの定義
  const [currentUser, setCurrentUser] = useState<null | firebase.User>(null)
  const [userInfo, setUserInfo] = useState<null | User>(null)

  // 渡された関数はレンダーの結果が画面に反映された後に動作
  // 関数の実行タイミングをReactのレンダリング後まで遅らせるhook
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      user ? setUser(user) : router.push('/login')
    })
  }, [])

  /**
   * ユーザー情報設定処理
   * @param user ユーザー
   */
  const setUser = (user) => {
    setCurrentUser(user)
    getUserData(user)
  }

  /**
   * ユーザー情報取得処理
   */
  const getUserData = async (user) => {
    console.info(currentUser)
    await firebase.firestore()
      .collection('/users')
      .doc(user.uid)
      .get()
      .then(function(doc) {
        if (doc.exists) {
          const data = doc.data()
          const user = {
            name: data.name
          }
          setUserInfo(user)
        }
      })
      .catch(function(error) {
        console.log("Error : ", error);
      })
  }

  return (
    <div>
      <Header name="ダッシュボード" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {userInfo && userInfo.name}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
