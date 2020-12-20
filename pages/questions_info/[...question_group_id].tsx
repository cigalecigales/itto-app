import React, { useEffect, useState, FC } from 'react'
import { useRouter } from 'next/router'
import firebase from 'firebase/app'

import { auth } from '../../utils/firebase'
import Button from '../../components/button'
import Header from '../../components/header'

/**
 * 問題集の情報
 */
type QuestionsListInfo = {
  name: string
  passLine: number
  totalQuestionsCount: number
}

/**
 * 問題の情報
 */
type Question = {
  id: string
  question: string
  commentary: string
  correctAnswer: number[]
  selections: string[]
  source: string
  user: string
  answer?: number[]
}

const QuestionsInfo: FC = () => {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<null | firebase.User>(null)
  const [questions, setQuestions] = useState<null | Question[]>([])
  const [questionGroupId, setQuestionGroupId] = useState<string>('')
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(false)
  const [score, setScore] = useState<null | string>(null)
  const [questionsListInfo, setQuestionsListInfo] = useState<null | QuestionsListInfo>(null)

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
    getQuestionsInfo()
  }

  /**
   * 問題集の情報取得処理
   */
  const getQuestionsInfo = async () => {

    // URLから問題集IDを取得
    const { question_group_id } = router.query
    const questionGroupId = question_group_id[0]
    setQuestionGroupId(questionGroupId)

    // 問題集情報取得
    await firebase.firestore()
      .collection('/question_groups')
      .doc(questionGroupId)
      .get()
      .then(function(doc) {
        if (doc.exists) {
          const data = doc.data()
          const questionsListInfo = {
            name: data.name,
            passLine: data.passLine,
            totalQuestionsCount: data.totalQuestionsCount
          }
          setQuestionsListInfo(questionsListInfo)
        }
      })
      .catch(function(error) {
        console.log("Error : ", error)
      })
    
    // 問題集一覧情報取得
    await firebase.firestore()
      .collection('/question_groups')
      .doc(questionGroupId)
      .collection('/questions')
      .get()
      .then(function(querySnapshot) {
        const questions = []
        querySnapshot.forEach(function(doc) {
          const docId = doc.id
          const data = doc.data()
          data.id = docId
          questions.push(data)
        })
        setQuestions(questions)
      })
      .catch(function(error) {
        console.log("Error : ", error)
      })
  }

  /**
   * 送信処理
   * @param event イベント
   */
  const handleSubmit = async　event => {
    event.preventDefault()
    setSubmitDisabled(true)
    
    // 履歴の登録処理
    await firebase.firestore()
      .collection('/users')
      .doc(currentUser.uid)
      .collection('/histories')
      .add({
        questionGroupId: questionGroupId,
        questions: questions
      })
    
    // 正解件数
    let count: number = 0
    questions.forEach(q => {
      // 正解の取得
      const correctAnswer = [...q.correctAnswer]
      correctAnswer.sort()
      const correctAnswerStr: string = correctAnswer.toString()

      // 現在の回答の取得
      let answerStr = ''
      if (q.answer) {
        const answer = Array.from(new Set([...q.answer]))
        answer.sort()
        answerStr = answer.toString()
      }

      // 正解と回答が合致していたら、正解件数を足す
      if (correctAnswerStr === answerStr) {
        count++
      }
    })

    const score: number = count / questions.length * 100
    const isPass = score >= questionsListInfo.passLine
    setScore('得点率: ' + score + '%' + (isPass ? ' (合格)' : ' (不合格)'))
  }

  /**
   * 選択肢チェック時の処理
   * @param event イベント
   */
  const handleChange = event => {
    // イベント発生対象取得
    const eventTargetName = event.target.name
    // 選択肢がチェックされていたか
    const eventTargetChecked = event.target.checked

    const eventInfo = eventTargetName.split('_')
    // 問題集一覧をコピー
    const copyQuestions = [...questions]

    copyQuestions.forEach(q => {
      // 問題IDを取得
      const questionId = eventInfo[0]
      // 問題Noを取得
      const questionNo = parseInt(eventInfo[1])

      // 問題IDが一致しない場合、処理対象外
      if (questionId !== q.id) {
        return
      }

      // 現在の回答状況を取得し、取得できなかった場合は初期化
      let answer
      try {
        answer = [...q.answer]
      } catch(e) {
        answer = []
      }

      // 選択されていた場合は、回答リストに追加し、
      // チェックが外された場合は該当項目を削除
      if (eventTargetChecked) {
        answer.push(questionNo)
      } else {
        var idx = answer.indexOf(questionNo)
        answer.splice(idx, 1)
      }
      
      // 最終的な回答リストを設定
      q.answer = answer
    })
    // 問題リストを最新化
    setQuestions(copyQuestions)
  }

  /**
   * 答えの表示処理
   * @param data 正解情報
   */
  const getAnswer = data => {
    const correctAnswer = [...data]
    correctAnswer.forEach((c, i) => {
      correctAnswer[i] = c + 1
    })

    return correctAnswer.join(', ')
  }

  return (
    <div>
      <Header name={questionsListInfo && (questionsListInfo.name + ` ( 合格ライン: ${questionsListInfo.passLine}%, 問題数: ${questionsListInfo.totalQuestionsCount} )`)} />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            {
              questions.map((question, qIdx) => (
                <div key={qIdx} className="mb-5">
                  <div className="font-bold bg-yellow-100 px-5 py-3">
                    <span>{'問題 ' + (qIdx + 1)}</span>
                    {submitDisabled && <span className="text-red-500">{' (答え ' + (getAnswer(question.correctAnswer)) + ')'}</span>}
                  </div>
                  <div className="px-5 py-3">{ question.question }</div>
                  <div className="px-5 py-3">
                    {
                      question.selections.map((s, i) => (
                        <div key={question.id + '_' + i} className="flex items-start py-1">
                          <div className="flex items-center h-5">
                            <label>
                              <input
                                type="checkbox"
                                name={question.id + '_' + i}
                                onClick={handleChange}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                              <span className="px-3">{(i + 1) + '. ' + s}</span>
                            </label>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))
            }
            {
              submitDisabled &&
              <div className="grid grid-cols-1">
                <div className="place-self-center border-t-2 border-b-2 border-gray-100 font-bold py-3 px-10">
                  {score}
                </div>
              </div>
            }
            {!submitDisabled && <Button name="採点" onClick={handleSubmit} />}
          </form>
        </div>
      </main>
    </div>
  )
}

export default QuestionsInfo
