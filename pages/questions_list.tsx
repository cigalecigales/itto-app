import React, { useEffect, useState, FC } from 'react'
import { useRouter } from 'next/router'
import firebase from 'firebase/app'

import { auth } from '../utils/firebase'
import Header from '../components/header'

type Question = {
  id: string
  name: string
  description: string
  passLine: number
  totalQuestionsCount: number
  user: string
  tags: string[]
}

const QuestionsList: FC = () => {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<null | object>(null)
  const [questions, setQuestions] = useState<null | Question[]>([])

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
    getQuestionsList()
  }

  /**
   * 問題集リスト取得処理
   */
  const getQuestionsList = async () => {
    await firebase.firestore()
      .collection('/question_groups')
      .get()
      .then(function(querySnapshot) {
        // 問題集リスト
        const questions: Question[] = []

        querySnapshot.forEach(function(doc) {
          // データ取得
          const docId = doc.id
          const data = doc.data()

          // 格納用データ作成
          const question: Question = {
            id: docId,
            name: data.name,
            description: data.description,
            passLine: data.passLine,
            totalQuestionsCount: data.totalQuestionsCount,
            user: data.user,
            tags: data.tags
          }
          questions.push(question)
        })
        
        // ステートの更新
        setQuestions(questions)
      })
      .catch(function(error) {
        console.log("Error : ", error)
      })
  }

  return (
    <div>
      <Header name="問題集一覧" />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          名前
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          説明
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          問題数
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          タグ
                        </th>
                      </tr>
                    </thead>
                    {
                      questions.map((question, idx) => (
                        <tbody
                          key={ question.id + '_' + idx } 
                          className="bg-white divide-y divide-gray-200 cursor-pointer hover:bg-gray-50"
                          onClick={() => router.push(`/questions_info/${question.id}`)}
                        >
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    { question.name }
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                              { question.description }
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-sm leading-5 text-gray-900 rounded-full">
                              { question.totalQuestionsCount }
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {
                                question.tags.map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="bg-pink-200 inline-block px-2 py-1 rounded-md m-1">
                                    { tag }
                                  </span>
                                ))
                              }
                            </td>
                          </tr>
                        </tbody>
                      ))
                    }
                  </table>
                </div>
              </div>
            </div>
          </div>


        </div>
      </main>
      
    </div>
  )
}

export default QuestionsList
