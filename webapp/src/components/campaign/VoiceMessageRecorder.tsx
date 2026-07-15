import * as React from "react"
import { Mic, Pause, Play, Square, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale"

const MAX_RECORD_SEC = 60
const SPEEDS = [1, 1.5, 2] as const

const COPY = {
  en: {
    record: "Record voice message",
    upload: "Upload audio file",
    recording: "Recording",
    stop: "Stop",
    micDenied: "Microphone access denied — allow it in your browser to record.",
    uploadError:
      "Couldn't read that audio file — try MP3, M4A, WAV, or OGG.",
  },
  es: {
    record: "Grabar mensaje de voz",
    upload: "Subir archivo de audio",
    recording: "Grabando",
    stop: "Detener",
    micDenied: "Acceso al micrófono denegado — permítelo en tu navegador para grabar.",
    uploadError:
      "No se pudo leer ese archivo de audio — prueba con MP3, M4A, WAV u OGG.",
  },
} as const

// A real recorded voice note — getUserMedia + MediaRecorder capture, with
// playback (play/pause, scrub, speed) and delete/re-record on the same
// card. Voice messages can also be uploaded as an audio file: some teams
// send recordings made outside Kombo (e.g. supplied by their own client),
// so the mic is not the only source. No backend to persist the blob to,
// so the object URL only lives for this browser session (revoked on
// unmount/re-record).
export function VoiceMessageRecorder({
  recordingUrl,
  durationSec,
  onRecorded,
  onDelete,
}: {
  recordingUrl?: string
  durationSec?: number
  onRecorded: (url: string, durationSec: number) => void
  onDelete: () => void
}) {
  const { locale } = useLocale()
  const c = COPY[locale]
  const [recording, setRecording] = React.useState(false)
  const [recordSec, setRecordSec] = React.useState(0)
  const [error, setError] = React.useState(false)
  const [uploadError, setUploadError] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [speedIdx, setSpeedIdx] = React.useState(0)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])
  const streamRef = React.useRef<MediaStream | null>(null)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  React.useEffect(() => {
    if (!recording) return
    const id = setInterval(() => {
      setRecordSec((s) => {
        if (s + 1 >= MAX_RECORD_SEC) {
          mediaRecorderRef.current?.stop()
          return MAX_RECORD_SEC
        }
        return s + 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [recording])

  async function startRecording() {
    setError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        onRecorded(url, recordSecRef.current)
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setRecording(false)
      }
      mediaRecorderRef.current = recorder
      setRecordSec(0)
      recorder.start()
      setRecording(true)
    } catch {
      setError(true)
    }
  }

  // MediaRecorder's onstop closure captures recordSec's value at mount time,
  // not its latest value — a ref keeps the interval's running count visible
  // to that callback.
  const recordSecRef = React.useRef(0)
  React.useEffect(() => {
    recordSecRef.current = recordSec
  }, [recordSec])

  function stopRecording() {
    mediaRecorderRef.current?.stop()
  }

  // An uploaded file feeds the same onRecorded contract as the mic — probe
  // it with an off-DOM <audio> first so the player gets a real duration.
  function handleFile(file: File) {
    setUploadError(false)
    setError(false)
    const url = URL.createObjectURL(file)
    const probe = new Audio()
    probe.onloadedmetadata = () => {
      const d = probe.duration
      onRecorded(url, Number.isFinite(d) ? Math.round(d) : 0)
    }
    probe.onerror = () => {
      URL.revokeObjectURL(url)
      setUploadError(true)
    }
    probe.src = url
  }

  React.useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (recordingUrl) URL.revokeObjectURL(recordingUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only clean up on unmount
  }, [])

  if (recording) {
    return (
      <div className="border-destructive/30 bg-destructive/5 flex items-center gap-3 rounded-md border px-3 py-2.5">
        <span className="relative flex size-2.5 shrink-0">
          <span className="bg-destructive absolute inline-flex size-full animate-ping rounded-full opacity-60" />
          <span className="bg-destructive relative inline-flex size-2.5 rounded-full" />
        </span>
        <span className="text-sm font-medium tabular-nums">
          {c.recording} · 0:{String(recordSec).padStart(2, "0")} / 1:00
        </span>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={stopRecording} aria-label={c.stop}>
          <Square className="size-4" />
        </Button>
      </div>
    )
  }

  if (recordingUrl) {
    const speed = SPEEDS[speedIdx]
    return (
      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <audio
          ref={audioRef}
          src={recordingUrl}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full"
          onClick={() => {
            const el = audioRef.current
            if (!el) return
            if (playing) el.pause()
            else el.play()
            setPlaying(!playing)
          }}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
        </Button>
        <input
          type="range"
          min={0}
          max={durationSec ?? 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => {
            const t = Number(e.target.value)
            setCurrentTime(t)
            if (audioRef.current) audioRef.current.currentTime = t
          }}
          className="accent-primary h-1 flex-1"
        />
        <span className="text-muted-foreground w-16 shrink-0 text-right text-xs tabular-nums">
          {String(Math.floor(currentTime / 60)).padStart(2, "0")}:
          {String(Math.floor(currentTime % 60)).padStart(2, "0")}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 px-2 text-xs"
          onClick={() => {
            const next = (speedIdx + 1) % SPEEDS.length
            setSpeedIdx(next)
            if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next]
          }}
        >
          {speed}x
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => {
            setPlaying(false)
            setCurrentTime(0)
            onDelete()
          }}
          aria-label="Delete"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-destructive text-xs">{c.micDenied}</p>}
      {uploadError && <p className="text-destructive text-xs">{c.uploadError}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant={error ? "outline" : "volt"}
          className="flex-1"
          onClick={startRecording}
        >
          <Mic className="size-4" />
          {c.record}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {c.upload}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        aria-label={c.upload}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
