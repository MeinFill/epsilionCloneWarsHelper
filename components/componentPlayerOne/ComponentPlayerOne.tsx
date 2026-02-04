import { useEffect, useState } from "react"
import { skillsT3 } from "../../store/skillsT3"
import "./ComponentPlayerOne.css"

type Props = {
  fightText: string
}

function ComponentPlayerOne({ fightText }: Props) {
  const [player, renamePlayer] = useState("")
  const [attack, addAttack] = useState(0)
  const [defense, addDefense] = useState(0)
  const [critical, addCritical] = useState(0)
  const [dodge, addDodge] = useState(0)
  const [counterStrike, addCounterStrike] = useState(0)
  const [miss, addMiss] = useState(0)
  const [playerClass, changePlayerClass] = useState(0)
  const [skillsPlayerHave, changeSkillsPlayerHave] = useState<Skill[]>([])

  interface Skill {
    name: string
    class: number[]
    attack?: number
    def?: number
    crit?: number
    dodge?: number
    counter?: number
    miss?: number
  }

  const playerNameChange = (name: string) => {
    renamePlayer(name)
  }

  const skillsUse = skillsPlayerHave.filter(
    (skill) =>
      (skill.attack ?? 0) <= attack &&
      (skill.def ?? 0) <= defense &&
      (skill.crit ?? 0) <= critical &&
      (skill.dodge ?? 0) <= dodge &&
      (skill.counter ?? 0) <= counterStrike &&
      (skill.miss ?? 0) <= miss,
  )

  const skillsCanUse = skillsT3.filter(
    (skill) =>
      (skill.attack ?? 0) <= attack &&
      (skill.def ?? 0) <= defense &&
      (skill.crit ?? 0) <= critical &&
      (skill.dodge ?? 0) <= dodge &&
      (skill.counter ?? 0) <= counterStrike &&
      (skill.miss ?? 0) <= miss &&
      skill.class.includes(playerClass) &&
      skillsPlayerHave.length < 5 &&
      !skillsPlayerHave.find((skills) => skills.name === skill.name),
  )

  const clickHaveSkill = (skill: Skill) => {
    addAttack((value) => value - (skill?.attack ?? 0))
    addDefense((value) => value - (skill?.def ?? 0))
    addCritical((value) => value - (skill?.crit ?? 0))
    addDodge((value) => value - (skill?.dodge ?? 0))
    addCounterStrike((value) => value - (skill?.counter ?? 0))
    addMiss((value) => value - (skill?.miss ?? 0))
  }

  const clickCanUseSkill = (skill: Skill) => {
    if (!skillsPlayerHave.find((skills) => skills.name === skill.name))
      changeSkillsPlayerHave((skills) => [...skills, skill])
    addAttack((value) => value - (skill?.attack ?? 0))
    addDefense((value) => value - (skill?.def ?? 0))
    addCritical((value) => value - (skill?.crit ?? 0))
    addDodge((value) => value - (skill?.dodge ?? 0))
    addCounterStrike((value) => value - (skill?.counter ?? 0))
    addMiss((value) => value - (skill?.miss ?? 0))
  }

  const clickPlusButton = (state: React.Dispatch<React.SetStateAction<number>>) => {
    state((value) => value + 1)
  }

  const clickMinusButton = (state: React.Dispatch<React.SetStateAction<number>>) => {
    state((value) => Math.max(value - 1, 0))
  }

  const clickPlayerClass = (newPlayerClass: React.SetStateAction<number>) => {
    playerClass != newPlayerClass ? changePlayerClass(newPlayerClass) : changePlayerClass(0)
  }


  let newFightText = fightText.replace(/[\s\S]*?Ход боя:\s*/u, "")
  newFightText = newFightText.replace(/Следующий ход:[\s\S]*/u, "")
  const lastComboIndex = newFightText.lastIndexOf("использует комбинацию")

  let combosText = ""
  let actionsText = newFightText

  if (lastComboIndex !== -1) {
    const endIndex = newFightText.indexOf(")", lastComboIndex)

    if (endIndex !== -1) {
      combosText = newFightText.slice(0, endIndex + 1).trim()
      actionsText = newFightText.slice(endIndex + 1).trim()
    }
  }
  combosText = combosText.replace(
    /(?![🗡🛡🥊⚡️🤺🌬])[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
    "",
  )
  let regex = new RegExp(`${player}\\s+\\d+\\s+использует комбинацию\\s+(.+?\\))`, "u")
  let match = combosText.match(regex)
  const combo = match ? match[1].trim() : null

  useEffect(() => {
    if (combo) {
      const foundSkill = skillsT3.find((skill) => skill.name === combo)
      if (foundSkill) {
        setTimeout(() => clickCanUseSkill(foundSkill), 0)
      }
    }
  }, [fightText])

  actionsText = actionsText.replace(
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D]/gu,
    "",
  )
  actionsText = actionsText.replace(/[^а-яА-Яa-zA-Z\s]/g, "")
  const playerNickname = player.replace(/[^а-яА-Яa-zA-Z\s]/g, "")

  const beatIndex = actionsText.match(/(\S+\s+бьет)/i)
  if (beatIndex && beatIndex.index !== undefined) {
    actionsText = actionsText.slice(beatIndex.index).trim()
  }

  regex = new RegExp(`(^|\\s)${playerNickname}\\s+бьет\\s`, "i")
  match = actionsText.match(regex)

  let playerAction = ""

  if (match && match.index !== undefined) {
    const startIndex = match.index

    const afterStart = actionsText.slice(startIndex + match[0].length)

    let endIndex = afterStart.search(/\sбьет\s/i)

    if (endIndex !== -1) {
      endIndex += startIndex + match[0].length
    } else {
      endIndex = actionsText.length
    }

    playerAction = actionsText.slice(startIndex, endIndex).trim()
  }

  useEffect(() => {
    if (!playerAction) return

    if (
      !playerAction.includes("блок") &&
      !playerAction.includes("промахивается") &&
      !playerAction.includes("увернулся")
    ) {
      clickPlusButton(addAttack)
    } else {
      clickPlusButton(addMiss)
    }

    if (playerAction.includes("крит")) {
      clickPlusButton(addCritical)
    }

    if (playerAction.includes("контр")) {
      clickPlusButton(addCounterStrike)
    }
  }, [playerAction])

  regex = new RegExp(`бьет\\s+${playerNickname}\\s+`, "i")
  match = actionsText.match(regex)

  if (!match) {
    regex = new RegExp(`по\\s+${playerNickname}\\s+`, "i")
    match = actionsText.match(regex)
  }

  let toPlayerAction = ""

  if (match && match.index !== undefined) {
    const startIndex = match.index

    const afterStart = actionsText.slice(startIndex + match[0].length)

    let endIndex = afterStart.search(/\sбьет\s/i)

    if (endIndex !== -1) {
      endIndex += startIndex + match[0].length
    } else {
      endIndex = actionsText.length
    }

    toPlayerAction = actionsText.slice(startIndex, endIndex).trim()
  }

  useEffect(() => {
    if (!toPlayerAction) return

    if (toPlayerAction.includes("блок")) {
      clickPlusButton(addDefense)
    }

    if (toPlayerAction.includes("увернулся") || toPlayerAction.includes("промахивается")) {
      clickPlusButton(addDodge)
    }
  }, [toPlayerAction])

  return (
    <div className="player-card">
      <div className="player-skills-have">
        {skillsUse.map((skill) => (
          <div className="skill-use" key={skill.name}>
            <button className="button-skill" onClick={() => clickHaveSkill(skill)}>
              {skill.name}
            </button>
          </div>
        ))}
      </div>
      <div className="player-setting">
        <div className="player-information">
          <div className="player-nickname">
            <input
              className="player-nick"
              value={player}
              onChange={(e) => playerNameChange(e.target.value)}
            ></input>
          </div>
          <div className="player-perks">
            <div className="perk">
              <p className="perk-count">
                <span>🗡</span>
                <span>{attack}</span>
              </p>
              <div className="perk-buttons">
                <button className="perk-button" onClick={() => clickPlusButton(addAttack)}>
                  +
                </button>
                <button className="perk-button" onClick={() => clickMinusButton(addAttack)}>
                  -
                </button>
              </div>
            </div>
            <div className="perk">
              <p className="perk-count">
                <span>🛡</span>
                <span>{defense}</span>
              </p>
              <div className="perk-buttons">
                <button className="perk-button" onClick={() => clickPlusButton(addDefense)}>
                  +
                </button>
                <button className="perk-button" onClick={() => clickMinusButton(addDefense)}>
                  -
                </button>
              </div>
            </div>
            <div className="perk">
              <p className="perk-count">
                <span>🥊</span>
                <span>{critical}</span>
              </p>
              <div className="perk-buttons">
                <button className="perk-button" onClick={() => clickPlusButton(addCritical)}>
                  +
                </button>
                <button className="perk-button" onClick={() => clickMinusButton(addCritical)}>
                  -
                </button>
              </div>
            </div>
            <div className="perk">
              <p className="perk-count">
                <span>⚡️</span>
                <span>{dodge}</span>
              </p>
              <div className="perk-buttons">
                <button className="perk-button" onClick={() => clickPlusButton(addDodge)}>
                  +
                </button>
                <button className="perk-button" onClick={() => clickMinusButton(addDodge)}>
                  -
                </button>
              </div>
            </div>
            <div className="perk">
              <p className="perk-count">
                <span>🤺</span>
                <span>{counterStrike}</span>
              </p>
              <div className="perk-buttons">
                <button className="perk-button" onClick={() => clickPlusButton(addCounterStrike)}>
                  +
                </button>
                <button className="perk-button" onClick={() => clickMinusButton(addCounterStrike)}>
                  -
                </button>
              </div>
            </div>
            <div className="perk">
              <p className="perk-count">
                <span>🌬</span>
                <span>{miss}</span>
              </p>
              <div className="perk-buttons">
                <button className="perk-button" onClick={() => clickPlusButton(addMiss)}>
                  +
                </button>
                <button className="perk-button" onClick={() => clickMinusButton(addMiss)}>
                  -
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="player-classes">
          <button className={`defender-class ${playerClass === 1 ? "choosen" : ""}`} onClick={() => clickPlayerClass(1)}>
            🛡
          </button>
          <button className={`berserk-class ${playerClass === 2 ? "choosen" : ""}`} onClick={() => clickPlayerClass(2)}>
            🪓
          </button>
          <button className={`dodge-class ${playerClass === 3 ? "choosen" : ""}`} onClick={() => clickPlayerClass(3)}>
            ⚡️
          </button>
          <button className={`cd-class ${playerClass === 4 ? "choosen" : ""}`} onClick={() => clickPlayerClass(4)}>
            💩
          </button>
        </div>
      </div>
      <div className="player-skills-can-use">
        {skillsCanUse.map((skill) => (
          <div className="skill-can-use" key={skill.name}>
            <button className="button-skill" onClick={() => clickCanUseSkill(skill)}>
              {skill.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ComponentPlayerOne
