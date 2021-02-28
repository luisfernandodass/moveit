import { createContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import challenges from '../../challenges.json'
import { LevelUpModal } from '../componentes/LevelUpModal';


interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;
}

interface ChallengesContextData {
    level: number;
    currentExperience: number;
    experienceToNextLevel: number;
    challengesCompleted: number;
    activeChallenge: Challenge;
    resetChallenge: () => void;
    completeChallenge: () => void;
    closeLevelUpModal: () => void;
    startNewChallenge: () => void;
    levelUp: () => void;
}

interface ChallengesProviderProps{
    children: ReactNode; // "ReactNode pega todos os elementos filhos (childrens)"  
    level: number;
    currentExperience: number;
    challengesCompleted: number; 
}

export const ChallengesContext = createContext ({} as ChallengesContextData);

export function ChallengesProvider({ 
    children,
    ...rest
 }: ChallengesProviderProps){
    const [level, setLevel] = useState(rest.level ?? 1);
    const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
    const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0);

    const [activeChallenge, setActiveChallenge] = useState(null)
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false)


    const experienceToNextLevel = Math.pow((level + 1) *  4, 2) // "Math.pow" é um utilizado para potência

    useEffect(() => {
        Notification.requestPermission();
    }, [])

    useEffect(() => {
        Cookies.set('level', String(level));
        Cookies.set('currentExperience', String(currentExperience));
        Cookies.set('challengesCompleted', String(challengesCompleted));
    }, [level, currentExperience, challengesCompleted]);

    function levelUp(){
      setLevel(level + 1);
      setIsLevelUpModalOpen(true)
  }

  function closeLevelUpModal(){
    setIsLevelUpModalOpen(false)
  }

  function startNewChallenge(){
      const randomChallengeIndex = Math.floor(Math.random() * challenges.length) // "Math.random" retorna um número aleatório podendo ser quebrado. O "Math.floor" retorna valores inteiros
      const challenge = challenges[randomChallengeIndex];

      setActiveChallenge(challenge)

      new Audio('/notification.mp3').play();

      if(Notification.permission === 'granted'){
          new Notification('Novo desafio',{
              body: `Valendo ${challenge.amount}xp!`
          })
      }
    }

    function resetChallenge(){
      setActiveChallenge(null);
    }

    function completeChallenge(){
        if (!activeChallenge){
            return;
        }

        const { amount } = activeChallenge;

        let finalExperience = currentExperience + amount;

        if(finalExperience >= experienceToNextLevel){
            finalExperience = finalExperience - experienceToNextLevel;
            levelUp();
        }

        setCurrentExperience(finalExperience);
        setActiveChallenge(null);
        setChallengesCompleted(challengesCompleted + 1);
      }

    return(
        <ChallengesContext.Provider value={{
             level,
             levelUp,
             currentExperience,
             challengesCompleted,
             experienceToNextLevel,
             closeLevelUpModal,
             startNewChallenge,
             activeChallenge,
             resetChallenge,
             completeChallenge,
             }}
             >
            { children }

            { isLevelUpModalOpen && <LevelUpModal/>}
        </ChallengesContext.Provider>
    );
}