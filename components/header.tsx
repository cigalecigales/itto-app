import { useRouter } from 'next/router'
import firebase from 'firebase/app'
import React, { useEffect, useState, FC } from 'react'

import { auth } from '../utils/firebase'
import './styles/header.module.css'

type Props = {
  name: string
}

const Header: FC<Props> = (props) => {

  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<null | firebase.User>(null)
  const [isAuth, setAuth] = useState<boolean>(false)

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      user ? setUser(user) : null
    })
  }, [])

  const setUser = (user: firebase.User) => {
    setCurrentUser(user)
    setAuth(true)
  }

  const logOut = async () => {
    try {
      await auth.signOut()
      router.push('/')
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div>
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-8 w-8" src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg" alt="Workflow" />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="/dashboard" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">ダッシュボード</a>
                  <a href="/questions_list" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">問題集一覧</a>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="ml-3 relative">
                  <div>
                    {
                      isAuth &&
                      <button
                        className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        id="user-menu"
                        aria-haspopup="true"
                        onClick={logOut}
                      >
                        ログアウト
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            { props.name }
          </h1>
        </div>
      </header>
    </div>
  )
}

export default Header
