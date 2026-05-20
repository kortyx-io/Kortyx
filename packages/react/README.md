# @kortyx/react

React hooks for Kortyx client streaming experiences.

## Install

```bash
npm install @kortyx/react
```

## Exports

- `useChat`
- `createRouteChatTransport`
- `createChatTransport`
- `createBrowserChatStorage`
- `useStructuredStreams`
- `createLiveChatPieces`
- `toHumanInputPiece`

`useChat` keeps finalized chat history in `messages` and the active assistant
response in `streamContentPieces` while a stream is running.

It also exposes stream controls for UI integrations:

- `abort()` / `canAbort`
- `error` / `clearError()`
- `clearMessages()`
- `resetSession()`
- `resetChat()`
- `respondToInterrupt(...)`

`clearMessages()` keeps the current session. `resetChat()` clears messages,
active stream state, errors, and the session id. Route transports forward
`abort()` through an `AbortSignal`; custom transports should forward
`context.signal` to their own request layer.

## License

Apache-2.0
