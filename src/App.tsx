import { useEffect, useState } from "react"
import ComponentPlayerOne from "../components/componentPlayerOne/ComponentPlayerOne"
import "./App.css"
import eps from "./assets/eps.png"

function App() {
  const [inputValue, setInputValue] = useState("")
  const [fightText, setFightText] = useState({ id: 0, text: "" })
  const [firstPlayerAttacks, setFirstPlayerAttacks] = useState<string[]>([])
  const [secondPlayerAttacks, setSecondPlayerAttacks] = useState<string[]>([])
  const [thirdPlayerAttacks, setThirdPlayerAttacks] = useState<string[]>([])
  const [fourthPlayerAttacks, setFourthPlayerAttacks] = useState<string[]>([])
  const [fifthPlayerAttacks, setFifthPlayerAttacks] = useState<string[]>([])
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

  function formatAttacks(attacks: string[]) {
    if (attacks.length === 0) return "атак не было"
    return attacks.join(',')
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
                                              Игрок 1: Голова, Голова, Грудь, Голова
                                              Игрок 2: Голова, Голова, Пояс, Голова
                                              Игрок 3: Ноги, Ноги, Грудь, Ноги
                                              Игрок 4: Живот, Живот, Грудь, Живот
                                              Игрок 5: Живот, Живот, Ноги, Живот

                                              Сейчас тебе нужно проанализировать для каждого игрока 3 наиболее вероятные зоны следующего удара. Анализ делай как хочешь, но учти, что это настоящие люди, и они как могут придерживаться какой-то тактики, так и бить наугад
                                              Ответ должен быть дан в таком формате:

                                              "Игрок 1: зона 1, зона 2, зона 3
                                              Игрок 2: зона 1, зона 2, зона 3
                                              Игрок 3: зона 1, зона 2, зона 3
                                              Игрок 4: зона 1, зона 2, зона 3
                                              Игрок 5: зона 1, зона 2, зона 3"

                                              Анализ нужно сделать для всех пятерых игроков, повторений зон у одного игрока быть не может!
                                              Если тебе не хватает данных, то верни для каждого игрока "Для аналитики недостаточно данных"
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
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={firstPlayerAnswer} attacks={firstPlayerAttacks} setAttacks={setFirstPlayerAttacks} />
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={secondPlayerAnswer} attacks={secondPlayerAttacks} setAttacks={setSecondPlayerAttacks} />
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={thirdPlayerAnswer} attacks={thirdPlayerAttacks} setAttacks={setThirdPlayerAttacks} />
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={fourthPlayerAnswer} attacks={fourthPlayerAttacks} setAttacks={setFourthPlayerAttacks} />
          <ComponentPlayerOne fightText={fightText.text} gigaAnswer={fifthPlayerAnswer} attacks={fifthPlayerAttacks} setAttacks={setFifthPlayerAttacks} />
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
