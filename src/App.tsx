import { useEffect, useState } from "react"
import ComponentPlayerOne from "../components/componentPlayerOne/ComponentPlayerOne"
import "./App.css"
import eps from "./assets/eps.png"

function App() {
  const [inputValue, setInputValue] = useState("")
  const [fightText, setFightText] = useState({ id: 0, text: "" })
  const [gigaAnswers, setGigaAnswer] = useState<string[]>([])

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
          role: 'user', content: `Напиши сообщение: 
                                              "Игрок 1: Первый
                                              Игрок 2: Второй
                                              Игрок 3: Третий
                                              Игрок 4: Четвертый
                                              Игрок 5: Пятый"

                                              Никаких пояснений, никаких лишних символов. Только этот список, строго в этом формате` }],
        temperature: 1,
        max_tokens: 40
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
        setGigaAnswer(answers)
      })
      .catch(() => {
        if (isMounted) setGigaAnswer(Array(5).fill("Ошибка"))
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
          {gigaAnswers.map((answer) => (
            <ComponentPlayerOne
              fightText={fightText.text}
              gigaAnswer={answer}
            />
          ))}
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
