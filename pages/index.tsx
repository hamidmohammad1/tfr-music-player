import { useState, useEffect } from 'react'
import durationInSecToTime from '../functions/durationInSecToTime'

type Event = {
  unixTime: number
  text: string
  initials: string
}
/*const event =  {
    unixTime: Math.round(new Date().getTime() / 1000),
    text: 'Hello',
    initials: 'HYM',
  }*/

async function getEvent(): Promise<Event> {
  const res = await fetch('/assets/approve.json', { cache: 'no-store' })
  const event = await res.json()
  return event
}

async function getGifs(): Promise<string[]> {
  const res = await fetch('/assets/gifs.json', { cache: 'no-store' })
  const gifs = await res.json()
  console.log('Hentede gifs: ', gifs.gifs)
  return gifs.gifs
}

function Home() {
  const DEFAULT_INDEX = 'Default'
  const SEC_TO_MS = 1000
  const FETCH_TIME = 10 * SEC_TO_MS
  const ACCEPT_TIME_SEC = 15
  let blocked = false

  const [duration, setDuration] = useState(86400)
  const [text, setText] = useState('')
  const [gifId, setGifId] = useState(DEFAULT_INDEX)
  const [audio, setAudio] = useState<any>(null)
  const [play, setPlay] = useState(false)
  const [soundAccepted, setSoundAccepted] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [gifs, setGifs] = useState<any>({
    Default: 'https://giphy.com/embed/blSTtZehjAZ8I',
  })

  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth)
  }

  function setDurationInterval() {
    setDuration((oldCount) => oldCount + 1)
  }

  async function fetchDatabaseInterval() {
    const unixTimeNow = Date.now()

    const event = await getEvent()
    const secEvent = event.unixTime
    const secNow = Math.round(unixTimeNow / SEC_TO_MS)
    setDuration(secNow - secEvent)

    if (
      blocked ||
      secNow + 2 < secEvent ||
      secNow - secEvent > ACCEPT_TIME_SEC
    ) {
      return
    }
    console.log('Nu    tid:', secNow)
    console.log('Event tid:', event.unixTime)

    blocked = true
    const initialsAudio = '/assets/' + event.initials + '.mp3'
    const defaultAudio = '/assets/' + DEFAULT_INDEX + '.mp3'
    const urlMusic = true ? initialsAudio : defaultAudio
    const audio = new Audio(urlMusic)
    const gifIndex = event.initials in gifs ? event.initials : DEFAULT_INDEX

    setAudio(audio)
    setText(event.text)
    setGifId(gifIndex)
    setPlay(true)

    setTimeout(function () {
      blocked = false
    }, (ACCEPT_TIME_SEC + 1) * SEC_TO_MS)
  }

  useEffect(() => {
    getGifs().then((res) => setGifs(res))
    getEvent().then((res) => {
      const unixTimeNow = Date.now()
      const secEvent = res.unixTime
      const secNow = Math.round(unixTimeNow / SEC_TO_MS)
      setDuration(secNow - secEvent)
    })

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
      setGifId(DEFAULT_INDEX)
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
