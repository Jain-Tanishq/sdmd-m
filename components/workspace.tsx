"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Maximize2,
  Moon,
  Plus,
  Hash,
  Users,
  MessageSquare,
  Clock,
  Share2,
  Camera,
  Search,
  Mic,
  LogOut,
  Trash2,
  Settings,
  HelpCircle,
  Medal,
  Send,
  MoveIcon,
  AlertCircle,
  Edit,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

interface Server {
  id: string
  name: string
  description: string
  members: Member[]
  channels: Channel[]
  inviteCode: string
  emoji: string
  rules: string
  adminId: string
}

interface Channel {
  id: string
  name: string
  messages: Message[]
}

interface Message {
  id: string
  content: string
  type: "text" | "image" | "audio"
  sender: Member
  timestamp: Date
  editedAt?: Date
}

interface Member {
  id: string
  name: string
  avatar: string
  isStudying: boolean
  currentSubject?: string
  studyTime: number
  joinedAt: Date
}

interface StudySession {
  id: string
  memberId: string
  subject: string
  duration: number
  timestamp: Date
}

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Literature",
  "Computer Science",
  "Economics",
  "Psychology",
  "Art",
]

export function Workspace() {
  const [content, setContent] = useState("")
  const [showCommands, setShowCommands] = useState(false)
  const [servers, setServers] = useState<Server[]>([])
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [currentMember, setCurrentMember] = useState<Member>({
    id: uuidv4(),
    name: "You",
    avatar: "/placeholder.svg?height=40&width=40",
    isStudying: false,
    studyTime: 0,
    joinedAt: new Date(),
  })
  const [studyTimer, setStudyTimer] = useState(0)
  const [studySubject, setStudySubject] = useState("")
  const [showCreateServer, setShowCreateServer] = useState(false)
  const [showJoinServer, setShowJoinServer] = useState(false)
  const [newServerData, setNewServerData] = useState({ name: "", description: "", emoji: "📚", rules: "" })
  const [joinCode, setJoinCode] = useState("")
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [editingRules, setEditingRules] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showSubjectSelection, setShowSubjectSelection] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFloatingTimer, setShowFloatingTimer] = useState(false)
  const [showServerInfo, setShowServerInfo] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    let intervalId: number | undefined
    if (currentMember.isStudying) {
      intervalId = window.setInterval(() => {
        setStudyTimer((prevTimer) => prevTimer + 1000)
      }, 1000)
    }
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [currentMember.isStudying])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      e.key === "/" &&
      (e.target as HTMLElement).tagName !== "INPUT" &&
      (e.target as HTMLElement).tagName !== "TEXTAREA"
    ) {
      e.preventDefault()
      setShowCommands((prev) => !prev)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const createServer = useCallback(() => {
    if (!newServerData.name.trim()) return
    const newServer: Server = {
      id: uuidv4(),
      name: newServerData.name,
      description: newServerData.description,
      members: [currentMember],
      channels: [{ id: uuidv4(), name: "general", messages: [] }],
      inviteCode: uuidv4().slice(0, 8),
      emoji: newServerData.emoji,
      rules: newServerData.rules,
      adminId: currentMember.id,
    }
    setServers((prev) => [...prev, newServer])
    setSelectedServer(newServer)
    setSelectedChannel(newServer.channels[0])
    setShowCreateServer(false)
    setNewServerData({ name: "", description: "", emoji: "📚", rules: "" })
    toast({
      title: "Server created!",
      description: `You've successfully created the server "${newServer.name}". Invite code: ${newServer.inviteCode}`,
    })
  }, [newServerData, currentMember, toast])

  const joinServer = useCallback(() => {
    const server = servers.find((s) => s.inviteCode === joinCode)
    if (!server) {
      toast({
        title: "Invalid invite code",
        description: "Please check the code and try again",
        variant: "destructive",
      })
      return
    }
    if (server.members.some((m) => m.id === currentMember.id)) {
      toast({
        title: "Already a member",
        description: "You're already in this server",
        variant: "destructive",
      })
      return
    }
    const updatedServer = {
      ...server,
      members: [...server.members, { ...currentMember, joinedAt: new Date() }],
    }
    setServers((prev) => prev.map((s) => (s.id === server.id ? updatedServer : s)))
    setSelectedServer(updatedServer)
    setSelectedChannel(updatedServer.channels[0])
    setShowJoinServer(false)
    setJoinCode("")
    toast({
      title: "Server joined!",
      description: `You've successfully joined the server "${updatedServer.name}".`,
    })
    setShowRules(true)
  }, [joinCode, servers, currentMember, toast])

  const leaveServer = useCallback(() => {
    if (!selectedServer) return
    if (selectedServer.adminId === currentMember.id) {
      toast({
        title: "Cannot leave server",
        description: "As the server creator, you cannot leave this server. You can delete it instead.",
        variant: "destructive",
      })
      return
    }
    const updatedServer = {
      ...selectedServer,
      members: selectedServer.members.filter((m) => m.id !== currentMember.id),
    }
    setServers((prev) => prev.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
    setSelectedServer(null)
    setSelectedChannel(null)
    toast({
      title: "Server left",
      description: `You've left the server "${selectedServer.name}".`,
    })
  }, [selectedServer, currentMember.id, toast])

  const deleteServer = useCallback(() => {
    if (!selectedServer || selectedServer.adminId !== currentMember.id) return
    setServers((prev) => prev.filter((s) => s.id !== selectedServer.id))
    setSelectedServer(null)
    setSelectedChannel(null)
    toast({
      title: "Server deleted",
      description: `You've deleted the server "${selectedServer.name}".`,
    })
  }, [selectedServer, currentMember.id, toast])

  const sendMessage = useCallback(() => {
    if (!content.trim() || !selectedChannel || !selectedServer) return
    const newMessage: Message = {
      id: uuidv4(),
      content,
      type: "text",
      sender: currentMember,
      timestamp: new Date(),
    }
    const updatedChannel = {
      ...selectedChannel,
      messages: [...selectedChannel.messages, newMessage],
    }
    const updatedServer = {
      ...selectedServer,
      channels: selectedServer.channels.map((c) => (c.id === selectedChannel.id ? updatedChannel : c)),
    }
    setServers((prev) => prev.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
    setSelectedServer(updatedServer)
    setSelectedChannel(updatedChannel)
    setContent("")
  }, [content, selectedChannel, selectedServer, currentMember])

  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!selectedChannel || !selectedServer) return
      const updatedChannel = {
        ...selectedChannel,
        messages: selectedChannel.messages.filter((m) => m.id !== messageId),
      }
      const updatedServer = {
        ...selectedServer,
        channels: selectedServer.channels.map((c) => (c.id === selectedChannel.id ? updatedChannel : c)),
      }
      setServers((prev) => prev.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
      setSelectedServer(updatedServer)
      setSelectedChannel(updatedChannel)
    },
    [selectedChannel, selectedServer],
  )

  const editMessage = useCallback(
    (message: Message, newContent: string) => {
      if (!selectedChannel || !selectedServer) return
      const updatedMessage = { ...message, content: newContent, editedAt: new Date() }
      const updatedChannel = {
        ...selectedChannel,
        messages: selectedChannel.messages.map((m) => (m.id === message.id ? updatedMessage : m)),
      }
      const updatedServer = {
        ...selectedServer,
        channels: selectedServer.channels.map((c) => (c.id === selectedChannel.id ? updatedChannel : c)),
      }
      setServers((prev) => prev.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
      setSelectedServer(updatedServer)
      setSelectedChannel(updatedChannel)
      setEditingMessage(null)
    },
    [selectedChannel, selectedServer],
  )

  const shareImage = useCallback(
    (file: File) => {
      if (!selectedChannel || !selectedServer) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const newMessage: Message = {
          id: uuidv4(),
          content: e.target?.result as string,
          type: "image",
          sender: currentMember,
          timestamp: new Date(),
        }
        const updatedChannel = {
          ...selectedChannel,
          messages: [...selectedChannel.messages, newMessage],
        }
        const updatedServer = {
          ...selectedServer,
          channels: selectedServer.channels.map((c) => (c.id === selectedChannel.id ? updatedChannel : c)),
        }
        setServers((prev) => prev.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
        setSelectedServer(updatedServer)
        setSelectedChannel(updatedChannel)
      }
      reader.readAsDataURL(file)
    },
    [selectedChannel, selectedServer, currentMember],
  )

  const startRecording = useCallback(() => {
    setIsRecording(true)
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data)
      })

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks)
        const audioUrl = URL.createObjectURL(audioBlob)

        if (selectedChannel && selectedServer) {
          const newMessage: Message = {
            id: uuidv4(),
            content: audioUrl,
            type: "audio",
            sender: currentMember,
            timestamp: new Date(),
          }
          const updatedChannel = {
            ...selectedChannel,
            messages: [...selectedChannel.messages, newMessage],
          }
          const updatedServer = {
            ...selectedServer,
            channels: selectedServer.channels.map((c) => (c.id === selectedChannel.id ? updatedChannel : c)),
          }
          setServers((prev) => prev.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
          setSelectedServer(updatedServer)
          setSelectedChannel(updatedChannel)
        }
      })

      mediaRecorder.start()
      setTimeout(() => {
        mediaRecorder.stop()
        setIsRecording(false)
      }, 5000)
    })
  }, [selectedChannel, selectedServer, currentMember])

  const startStudying = useCallback(() => {
    if (!studySubject) {
      setShowSubjectSelection(true)
      return
    }
    setCurrentMember((prev) => ({
      ...prev,
      isStudying: true,
      currentSubject: studySubject,
    }))
    setStudyTimer(0)
    setShowSubjectSelection(false)
    setShowFloatingTimer(true)
  }, [studySubject])

  const stopStudying = useCallback(() => {
    const session: StudySession = {
      id: uuidv4(),
      memberId: currentMember.id,
      subject: currentMember.currentSubject || "",
      duration: studyTimer,
      timestamp: new Date(),
    }
    setStudySessions((prev) => [...prev, session])
    setCurrentMember((prev) => ({
      ...prev,
      isStudying: false,
      currentSubject: undefined,
      studyTime: prev.studyTime + studyTimer,
    }))
    setStudyTimer(0)
    setStudySubject("")
    setShowFloatingTimer(false)
  }, [currentMember, studyTimer])

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const activeStudents = selectedServer?.members.filter((m) => m.isStudying).length || 0

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
    document.documentElement.classList.toggle("dark")
  }

  const copyRules = () => {
    if (selectedServer?.rules) {
      navigator.clipboard.writeText(selectedServer.rules)
      toast({
        title: "Rules copied!",
        description: "Server rules have been copied to your clipboard",
      })
    }
  }

  const updateRules = (newRules: string) => {
    if (selectedServer) {
      const updatedServer = {
        ...selectedServer,
        rules: newRules,
      }
      setServers((prev) => prev.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
      setSelectedServer(updatedServer)
    }
  }

  const copyInviteLink = () => {
    if (selectedServer?.inviteCode) {
      const inviteLink = `${window.location.origin}/invite/${selectedServer.inviteCode}`
      navigator.clipboard.writeText(inviteLink)
      toast({
        title: "Invite link copied!",
        description: "Share this link with others to join your server",
      })
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <div className={cn("h-full bg-background text-foreground flex flex-col", isDarkMode && "dark")}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{selectedServer?.emoji || "✏️"}</span>
            <h1 className="text-lg font-medium">{selectedServer?.name || "Study Space"}</h1>
            {selectedServer && (
              <Button variant="ghost" size="sm" onClick={() => setShowServerInfo(true)}>
                <Info className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!selectedServer && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreateServer(true)}>
                  Create Server
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowJoinServer(true)}>
                  Join Server
                </Button>
              </div>
            )}
            {selectedServer && (
              <>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{activeStudents} studying now</span>
                </div>
                <Button variant="outline" size="sm" onClick={copyInviteLink} className="border-dashed">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="container h-full px-4 py-6">
          {selectedChannel ? (
            <div className="h-full flex gap-6">
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                  {selectedChannel.messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 animate-fadeIn">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.sender.avatar} alt={msg.sender.name} />
                        <AvatarFallback>{msg.sender.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{msg.sender.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {msg.sender.id === currentMember.id && (
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setEditingMessage(msg)}
                                disabled={Date.now() - msg.timestamp.getTime() > 5 * 60 * 1000}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => deleteMessage(msg.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {editingMessage?.id === msg.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingMessage.content}
                              onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                            />
                            <Button onClick={() => editMessage(editingMessage, editingMessage.content)}>Save</Button>
                            <Button variant="ghost" onClick={() => setEditingMessage(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            {msg.type === "text" && <p className="text-sm">{msg.content}</p>}
                            {msg.type === "image" && (
                              <img
                                src={msg.content || "/placeholder.svg"}
                                alt="Shared"
                                className="max-w-sm rounded-lg"
                              />
                            )}
                            {msg.type === "audio" && (
                              <audio controls className="max-w-sm">
                                <source src={msg.content} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            )}
                          </>
                        )}
                        {msg.editedAt && <span className="text-xs text-muted-foreground">(edited)</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2 bg-muted p-2 rounded-lg">
                    <Textarea
                      ref={messageInputRef}
                      placeholder="Type a message..."
                      value={content}
                      onChange={(e) => {
                        if (e.target.value.length <= 150) {
                          setContent(e.target.value)
                          e.target.style.height = "auto"
                          e.target.style.height = `${e.target.scrollHeight}px`
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      className="flex-1 min-h-[44px] bg-transparent border-none focus-ring-0 resize-none"
                    />
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) shareImage(file)
                          }}
                        />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={startRecording} disabled={isRecording}>
                        <Mic className={cn("h-4 w-4", isRecording && "text-red-500")} />
                      </Button>
                      <Button size="icon" onClick={sendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Timer & Leaderboard */}
              <div className="w-80 space-y-6">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-semibold mb-4">Study Timer</h3>
                  <div className="space-y-4">
                    {currentMember.isStudying ? (
                      <>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Currently studying:</p>
                          <p className="font-medium">{currentMember.currentSubject}</p>
                        </div>
                        <div className="text-3xl font-mono text-center">{formatTime(studyTimer)}</div>
                        <Button className="w-full" variant="destructive" onClick={stopStudying}>
                          Stop Studying
                        </Button>
                      </>
                    ) : (
                      <Button className="w-full" onClick={startStudying}>
                        Start Studying
                      </Button>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="font-semibold mb-4">Today's Leaders</h3>
                  <div className="space-y-3">
                    {selectedServer?.members
                      .sort((a, b) => b.studyTime - a.studyTime)
                      .slice(0, 5)
                      .map((member, i) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="w-5 text-sm text-muted-foreground">
                            {i < 3 && (
                              <Medal
                                className={`h-4 w-4 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-600"}`}
                              />
                            )}
                            {i >= 3 && `#${i + 1}`}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.name}
                              {member.isStudying && (
                                <span className="ml-2 text-xs text-green-500">studying {member.currentSubject}</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatTime(member.studyTime)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a server or press '/' for commands
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 z-10 bg-background border-t">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            {selectedServer && (
              <Button variant="ghost" size="sm" onClick={() => setShowRules(true)}>
                Rules
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowFAQ(true)}>
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDarkMode}>
              <Moon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                toast({
                  title: "Report a Bug",
                  description: "This feature is coming soon!",
                })
              }}
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>

      {/* Command Menu */}
      {showCommands && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] max-w-[90vw] rounded-lg border bg-background shadow-lg">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Type a command or search..."
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              <div className="mb-2">
                <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Servers</h2>
                <button
                  className="w-full text-left px-2 py-1 text-sm rounded-md hover:bg-accent"
                  onClick={() => {
                    setShowCommands(false)
                    setShowCreateServer(true)
                  }}
                >
                  <Plus className="inline-block h-4 w-4 mr-2" />
                  Create new server
                </button>
                <button
                  className="w-full text-left px-2 py-1 text-sm rounded-md hover:bg-accent"
                  onClick={() => {
                    setShowCommands(false)
                    setShowJoinServer(true)
                  }}
                >
                  <Users className="inline-block h-4 w-4 mr-2" />
                  Join server
                </button>
                {servers.map((server) => (
                  <button
                    key={server.id}
                    className="w-full text-left px-2 py-1 text-sm rounded-md hover:bg-accent"
                    onClick={() => {
                      setSelectedServer(server)
                      setSelectedChannel(server.channels[0])
                      setShowCommands(false)
                    }}
                  >
                    <Hash className="inline-block h-4 w-4 mr-2" />
                    {server.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Server Dialog */}
      <Dialog open={showCreateServer} onOpenChange={setShowCreateServer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new server</DialogTitle>
            <DialogDescription>Create a space for your study group</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Server name</Label>
              <Input
                id="name"
                value={newServerData.name}
                onChange={(e) =>
                  setNewServerData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newServerData.description}
                onChange={(e) =>
                  setNewServerData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="emoji">Server Emoji</Label>
              <Input
                id="emoji"
                value={newServerData.emoji}
                onChange={(e) =>
                  setNewServerData((prev) => ({
                    ...prev,
                    emoji: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="rules">Server Rules</Label>
              <Textarea
                id="rules"
                value={newServerData.rules}
                onChange={(e) =>
                  setNewServerData((prev) => ({
                    ...prev,
                    rules: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreateServer(false)}>
                Cancel
              </Button>
              <Button onClick={createServer}>Create Server</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Server Dialog */}
      <Dialog open={showJoinServer} onOpenChange={setShowJoinServer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a server</DialogTitle>
            <DialogDescription>Enter an invite code to join a server</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Invite code</Label>
              <Input id="code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowJoinServer(false)}>
                Cancel
              </Button>
              <Button onClick={joinServer}>Join Server</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rules Dialog */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Server Rules</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="border rounded-md p-4">
              {editingRules ? (
                <Textarea value={selectedServer?.rules} onChange={(e) => updateRules(e.target.value)} rows={10} />
              ) : (
                <div className="whitespace-pre-wrap">{selectedServer?.rules}</div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowRules(false)}>
                Close
              </Button>
              {selectedServer?.adminId === currentMember.id && (
                <Button onClick={() => setEditingRules((prev) => !prev)}>{editingRules ? "Save" : "Edit"}</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subject Selection Dialog */}
      <Dialog open={showSubjectSelection} onOpenChange={setShowSubjectSelection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Subject</DialogTitle>
            <DialogDescription>Choose the subject you're about to study</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <Button
                key={subject}
                variant="outline"
                onClick={() => {
                  setStudySubject(subject)
                  setShowSubjectSelection(false)
                  startStudying()
                }}
              >
                {subject}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedServer ? (
              <>
                <div className="flex items-center justify-between">
                  <span>Leave Server</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={leaveServer}
                    disabled={selectedServer.adminId === currentMember.id}
                  >
                    Leave
                  </Button>
                </div>
                {selectedServer.adminId === currentMember.id && (
                  <div className="flex items-center justify-between">
                    <span>Delete Server</span>
                    <Button variant="destructive" size="sm" onClick={deleteServer}>
                      Delete
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p>Join a server to access more settings.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Server Info Dialog */}
      <Dialog open={showServerInfo} onOpenChange={setShowServerInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedServer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serverDescription">Description</Label>
              <Textarea
                id="serverDescription"
                value={selectedServer?.description || ""}
                onChange={(e) => {
                  if (selectedServer) {
                    const updatedServer = {
                      ...selectedServer,
                      description: e.target.value,
                    }
                    setServers((prev) => prev.map((s) => (s.id === selectedServer.id ? updatedServer : s)))
                    setSelectedServer(updatedServer)
                  }
                }}
                placeholder="Enter server description"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowServerInfo(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={showFAQ} onOpenChange={setShowFAQ}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Frequently Asked Questions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">How do I create a server?</h3>
              <p>
                Click on the "Create Server" button or use the command menu (press '/') and select "Create new server".
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How do I join a server?</h3>
              <p>
                Click on the "Join Server" button or use the command menu and select "Join server". You'll need an
                invite code from an existing server.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How do I start studying?</h3>
              <p>Click on the "Start Studying" button in the Study Timer section.</p>
            </div>
            <div>
              <h3 className="font-semibold">How do I send messages?</h3>
              <p>
                Type your message in the text box at the bottom of the chat and press Enter or click the send button.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">How do I share images or audio?</h3>
              <p>
                Click on the camera icon to share images, or the microphone icon to record and share audio messages.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Timer */}
      {showFloatingTimer && (
        <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg">
          <div className="text-2xl font-mono mb-2">{formatTime(studyTimer)}</div>
          <Button variant="outline" size="sm" onClick={stopStudying}>
            Stop Studying
          </Button>
        </div>
      )}

      <style jsx global>{`
        body {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        }
        body::-webkit-scrollbar {
          width: 8px;
        }
        body::-webkit-scrollbar-track {
          background: transparent;
        }
        body::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 20px;
          border: transparent;
        }
      `}</style>
    </div>
  )
}

