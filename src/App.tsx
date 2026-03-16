import { useState } from "react"
import ComponentPlayerOne from "../components/componentPlayerOne/ComponentPlayerOne"
import "./App.css"
import eps from "./assets/eps.png"

function App() {
  const [inputValue, setInputValue] = useState("")
  const [fightText, setFightText] = useState({ id: 0, text: "" })

  const setNewFightText = () => {
    setFightText({ id: fightText.id + 1, text: inputValue })
    setInputValue("")
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
          <ComponentPlayerOne fightText={fightText.text} playerId={0} />
          <ComponentPlayerOne fightText={fightText.text} playerId={1} />
          <ComponentPlayerOne fightText={fightText.text} playerId={2} />
          <ComponentPlayerOne fightText={fightText.text} playerId={3} />
          <ComponentPlayerOne fightText={fightText.text} playerId={4} />
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
