export default function durationInSecToTime(duration: number) {
  const hours = Math.floor(duration / (60 * 60))

  const remDurHours = duration - hours * 60 * 60
  const minutes = Math.floor((remDurHours / 60) % 60)

  const remDurMinutes = remDurHours - minutes * 60
  const seconds = Math.floor(remDurMinutes)

  const hoursStr = hours < 10 ? '0' + hours : hours
  const minutesStr = minutes < 10 ? '0' + minutes : minutes
  const secondsStr = seconds < 10 ? '0' + seconds : seconds

  return hoursStr + 'h:' + minutesStr + 'm:' + secondsStr + 's'
}
