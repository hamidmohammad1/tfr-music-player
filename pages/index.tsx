import { useState, useEffect } from 'react'
import durationInSecToTime from '../functions/durationInSecToTime'

type Event = {
  unixTime: number
  text: string
  initials: string
}

const backendUrl = 'https://tfr-music-backend.fly.dev/get'
const subUrl =
  'https://raw.githubusercontent.com/hamidmohammad1/tfr-music-store/main/'
const subUrlMp3 = 'https://github.com/hamidmohammad1/tfr-music-store/blob/main/'

async function getEvent(): Promise<Event> {
  const res = await fetch(backendUrl, {
    method: 'GET',
    cache: 'no-store',
  })
  const event = await res.json()
  console.log('Response:', event)
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
  const FETCH_TIME = 60 * SEC_TO_MS
  const ACCEPT_TIME = 90 * SEC_TO_MS

  const [isRendered, setIsRendered] = useState(false)
  const [duration, setDuration] = useState(86400)
  const [text, setText] = useState('')
  const [gifId, setGifId] = useState(1)
  const [audio, setAudio] = useState<any>(null)
  const [play, setPlay] = useState(false)
  const [gifs, setGifs] = useState<string[]>([])
  const [soundAccepted, setSoundAccepted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth)
  }

  function setDurationInterval() {
    setDuration((oldCount) => oldCount + 1)
  }

  async function fetchDatabaseInterval() {
    const unixTimeNow = Date.now()
    console.log('Checker nu!: ', Math.round(unixTimeNow / SEC_TO_MS))

    const event = await getEvent()
    setDuration(Math.round(unixTimeNow / SEC_TO_MS - event.unixTime))

    console.log(
      'DURATION:',
      Math.round(unixTimeNow / SEC_TO_MS - event.unixTime)
    )

    if (event.unixTime * SEC_TO_MS + ACCEPT_TIME < unixTimeNow) {
      return
    }

    const initialsAudio = subUrlMp3 + event.initials + '.mp3?raw=true'
    const defaultAudio = subUrlMp3 + 'Default' + '.mp3?raw=true'
    const urlMusic = true ? initialsAudio : defaultAudio
    const audio = new Audio(urlMusic)

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
      FETCH_TIME
    )

    handleWindowResize()
    window.addEventListener('resize', handleWindowResize)

    return () => {
      clearInterval(setDurationIntervalId)
      clearInterval(fetchDatabaseIntervalId)
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [soundAccepted])

  if (play && soundAccepted) {
    audio.onended = function () {
      if (typeof window !== 'undefined') {
        ;(window as any).responsiveVoice.speak(text, 'Danish Female')
      }

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
              if (typeof window !== 'undefined') {
                ;(window as any).responsiveVoice.clickEvent()
              }
            }}
          >
            Acccepter lyd
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='h-screen overflow-hidden w-screen flex flex-row justify-center bg-[#286464]'>
      <div className='h-full flex flex-col justify-center'>
        <div className={play ? '' : 'invisible h-0'}>
          <div className='flex flex-row justify-center text-center text-6xl text-gray-100 mb-10 px-4'>
            {text}
          </div>
          <div className='flex flex-row justify-center'>
            <iframe src={gifs[gifId]} width={windowWidth * 80} />
          </div>
        </div>
        <div className={play ? 'invisible h-0' : 'text-gray-100'}>
          <div className='text-9xl pb-8 text-center'>Wait for it ...</div>
          <div className='text-4xl text-center'>
            Tid siden sidste approve: {durationInSecToTime(duration)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
