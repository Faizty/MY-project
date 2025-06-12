"use client"

import { useWebSocket } from "@/context/websocket-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react"

export function ConnectionStatus() {
  const { isConnected, isConnecting, reconnect } = useWebSocket()

  if (isConnecting) {
    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <div className="flex items-center">
          <Badge variant="secondary" className="mr-2">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Connecting
          </Badge>
          <span className="text-sm text-blue-700">Connecting to messaging service...</span>
        </div>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
        <div className="flex items-center">
          <Badge variant="default" className="mr-2 bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
          <span className="text-sm text-green-700">Real-time messaging active</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
      <div className="flex items-center">
        <Badge variant="destructive" className="mr-2">
          <AlertCircle className="h-3 w-3 mr-1" />
          Disconnected
        </Badge>
        <span className="text-sm text-red-700">Not connected to messaging service</span>
      </div>
      <Button size="sm" onClick={reconnect} variant="outline" className="border-red-300">
        <RefreshCw className="h-3 w-3 mr-1" />
        Reconnect
      </Button>
    </div>
  )
}
