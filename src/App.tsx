import { useEffect, useState } from "react"
import ComponentPlayerOne from "../components/componentPlayerOne/ComponentPlayerOne"
import "./App.css"
import eps from "./assets/eps.png"

function App() {
  const [inputValue, setInputValue] = useState("")
  const [fightText, setFightText] = useState({ id: 0, text: "" })
  const [firstPlayerAnswer, setFirstPlayerAnswer] = useState("")
  const [secondPlayerAnswer, setSecondPlayerAnswer] = useState("")
  const [thirdPlayerAnswer, setThirdPlayerAnswer] = useState("")
  const [fourthPlayerAnswer, setFourthPlayerAnswer] = useState("")
  const [fifthPlayerAnswer, setFifthPlayerAnswer] = useState("")

  const setNewFightText = () => {
    setFightText({ id: fightText.id + 1, text: inputValue })
    setInputValue("")
  }

  const BASE64_AUTH = 'MDE5Y2U1YmItYzUwZC03NGJkLTg3NDAtY2YxZDU1ZTI4YTk5OmMwNDZiMTk5LTdkZWUtNDJlNy05NWUwLTM1MGMxZTFiZTE4NA==';

  async function getToken() {
    const res = await fetch('/api/gigachat-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${BASE64_AUTH}`,
        'RqUID': crypto.randomUUID?.() || '123e4567-e89b-12d3-a456-426614174000'
      }
    });

    const data = await res.json();
    return data.access_token;
  }

  async function askGigaChat() {
    const token = await getToken();

    const res = await fetch('/api/gigachat-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model: 'GigaChat',
        messages: [{
          role: 'user', content: `Мы с тобой играем в игру "Угадай куда будет бить игрок. Есть 5 зон: Голова, грудь, живот, пояс, ноги. Дальше я тебе напишу куда били игроки: 
                                              Soulnishko: Ноги, Голова, Живот, Голова, Грудь, Грудь, Живот
                                              VLGAmurr99: Ноги, Ноги, Голова, Голова, Голова, Живот, Ноги
                                              ХАХАХАХАНТ: Ноги, Ноги, Грудь, Голова, Живот, Голова, Пояс
                                              Mike413: Живот, Голова, Грудь, Пояс, Голова, Грудь, Живот
                                              Rew: Ноги, Грудь, Пояс, Голова, Пояс, Пояс, Грудь

                                              Сейчас тебе нужно проанализировать для каждого игрока 3 наиболее вероятные зоны следующего удара. Анализ делай как хочешь, но учти, что это настоящие люди, и они как могут придерживаться какой-то тактики, так и бить наугад
                                              Ответ должен быть дан в таком формате:

                                              "Soulnishko: зона 1, зона 2, зона 3
                                              VLGAmurr99: зона 1, зона 2, зона 3
                                              ХАХАХАХАНТ: зона 1, зона 2, зона 3
                                              Mike413: зона 1, зона 2, зона 3
                                              Rew: зона 1, зона 2, зона 3"

                                              Анализ нужно сделать для всех пятерых игроков, повторений зон у одного игрока быть не может!
                                              Никаких пояснений, никаких лишних символов. Только этот список, строго в этом формате, потому что это пойдет в парсинг` }],
        temperature: 1,
        max_tokens: 150
      })
    });

    const data = await res.json();
    return data.choices[0].message.content;
  }

  useEffect(() => {
    let isMounted = true

    askGigaChat()
      .then((rawAnswer) => {
        if (!isMounted) return

        // Парсим ответ
        const answers = parseGigaResponse(rawAnswer)
        console.log(answers)
        setFirstPlayerAnswer(answers[0])
        setSecondPlayerAnswer(answers[1])
        setThirdPlayerAnswer(answers[2])
        setFourthPlayerAnswer(answers[3])
        setFifthPlayerAnswer(answers[4])
      })

    return () => { isMounted = false }
  }, [])

  function parseGigaResponse(answer: string): string[] {
    return answer
      .split('\n')
      .filter(line => line.includes(':'))
      .map(line => line.split(':')[1]?.trim() || '')
      .slice(0, 5)
  }

  return (
    <>
      <div className="page">
        <div>
          <a href="https://t.me//EpsilionWarBot" target="_blank">
            <img src={eps} className="logo  " alt="logo" />
          </a>
        </div>
        <div className="players-list">
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={firstPlayerAnswer} />
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={secondPlayerAnswer} />
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={thirdPlayerAnswer} />
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={fourthPlayerAnswer} />
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={fifthPlayerAnswer} />
        </div>
        <div className="input-div">
          <textarea
            className="text-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          ></textarea>
          <button className="button-set-text" onClick={() => setNewFightText()}>
            Отправить
          </button>
        </div>
      </div>
    </>
  )
}

export default App
