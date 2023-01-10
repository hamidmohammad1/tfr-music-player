import { useState, useEffect } from 'react'
import durationInSecToTime from '../functions/durationInSecToTime'

type Event = {
  unixTime: number
  text: string
  initials: string
}

const subUrl =
  'https://raw.githubusercontent.com/hamidmohammad1/tfr-music-store/main/'
const subUrlMp3 = 'https://github.com/hamidmohammad1/tfr-music-store/blob/main/'

async function getDatabase(): Promise<Event> {
  const res = await fetch(subUrl + 'database.json', { cache: 'no-store' })
  const event = await res.json()
  return event
}

async function getGifs(): Promise<string[]> {
  const res = await fetch(subUrl + 'gifs.json', { cache: 'no-store' })
  const gifs = await res.json()

  console.log('Hentede gifs: ', gifs.gifs)
  return gifs.gifs
}

function Home() {
  const SEC_TO_MS = 1000
  const MIN_TO_SEC = 60
  const FETCH_TIME_IN_MIN = 5

  const [isRendered, setIsRendered] = useState(false)
  const [duration, setDuration] = useState(86400)
  const [text, setText] = useState('')
  const [gifId, setGifId] = useState(1)
  const [audio, setAudio] = useState<any>(null)
  const [play, setPlay] = useState(false)
  const [gifs, setGifs] = useState<string[]>([])
  const [soundAccepted, setSoundAccepted] = useState(false)

  function setDurationInterval() {
    setDuration((oldCount) => oldCount + 1)
  }

  async function fetchDatabaseInterval() {
    const unixTimeNow = Date.now()
    console.log('Checker nu!: ', Math.round(unixTimeNow / 1000))

    const event = await getDatabase()
    console.log(event)
    setDuration(Math.round((unixTimeNow - event.unixTime * SEC_TO_MS) / 1000))

    if (
      (event.unixTime + FETCH_TIME_IN_MIN * MIN_TO_SEC) * SEC_TO_MS <
      unixTimeNow
    ) {
      return
    }

    const initialsAudio = subUrlMp3 + event.initials + '.mp3?raw=true'
    const defaultAudio = subUrlMp3 + 'Default' + '.mp3?raw=true'
    const urlMusic = true ? initialsAudio : defaultAudio

    const audio = new Audio(urlMusic)
    //audio.crossOrigin = 'anonymous'

    setAudio(audio)
    setText(event.text)
    setGifId(Math.floor(Math.random() * gifs.length))
    setPlay(true)
  }

  useEffect(() => {
    if (!isRendered) {
      setIsRendered(true)
      fetchDatabaseInterval() // Initial Check
      getGifs().then((res) => setGifs(res))
    }

    const setDurationIntervalId = setInterval(
      setDurationInterval,
      1 * SEC_TO_MS
    )

    const fetchDatabaseIntervalId = setInterval(
      fetchDatabaseInterval,
      FETCH_TIME_IN_MIN * MIN_TO_SEC * SEC_TO_MS
    )

    return () => {
      clearInterval(setDurationIntervalId)
      clearInterval(fetchDatabaseIntervalId)
    }
  }, [soundAccepted])

  if (play) {
    audio.onended = function () {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
      setPlay(false)
      setText('')
      setGifId(1)
      setAudio(null)
    }

    audio.play()
  }

  if (!soundAccepted) {
    return (
      <div className='h-[100vh] w-[100vw] flex flex-row justify-center bg-[#286464]'>
        <div className='flex flex-col justify-center'>
          <button
            className='text-5xl text-white bg-yellow-600 p-6 rounded-lg'
            onClick={() => {
              setSoundAccepted(true)
            }}
          >
            Acccepter lyd
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='h-[100vh] w-[100vw] flex flex-row justify-center bg-[#286464]'>
      <div className='h-full flex flex-col justify-center'>
        {play ? (
          <div>
            <div className='flex flex-row justify-center text-6xl text-gray-100 mb-10'>
              {text}
            </div>
            <iframe
              src={gifs[gifId]}
              width='100%'
              height='100%'
              allowFullScreen
            />
          </div>
        ) : (
          <div className='text-gray-100'>
            <div className='text-9xl pb-8 text-center'>Wait for it ...</div>

            <div className='text-4xl'>
              Tid siden sidste approve: {durationInSecToTime(duration)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
