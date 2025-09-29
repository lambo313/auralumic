import React, { createContext, useContext, useReducer } from "react"

interface Reader {
  id: string
  name: string
  avatarUrl?: string
  bio: string
  specialties: string[]
  rating: number
  reviewCount: number
  status: "available" | "busy" | "offline"
  completedReadings: number
  languages: string[]
  isVerified: boolean
}

interface ReaderState {
  readers: Reader[]
  loading: boolean
  error: string | null
  selectedReader: Reader | null
}

type ReaderAction =
  | { type: "SET_READERS"; payload: Reader[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_SELECTED_READER"; payload: Reader | null }
  | { type: "UPDATE_READER_STATUS"; payload: { id: string; status: Reader["status"] } }

const initialState: ReaderState = {
  readers: [],
  loading: false,
  error: null,
  selectedReader: null,
}

const ReaderContext = createContext<
  | {
      state: ReaderState
      dispatch: React.Dispatch<ReaderAction>
      getReader: (id: string) => Reader | undefined
      updateReaderStatus: (id: string, status: Reader["status"]) => void
    }
  | undefined
>(undefined)

function readerReducer(state: ReaderState, action: ReaderAction): ReaderState {
  switch (action.type) {
    case "SET_READERS":
      return {
        ...state,
        readers: action.payload,
        loading: false,
        error: null,
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    case "SET_SELECTED_READER":
      return {
        ...state,
        selectedReader: action.payload,
      }
    case "UPDATE_READER_STATUS":
      return {
        ...state,
        readers: state.readers.map((reader) =>
          reader.id === action.payload.id
            ? { ...reader, status: action.payload.status }
            : reader
        ),
        selectedReader:
          state.selectedReader?.id === action.payload.id
            ? { ...state.selectedReader, status: action.payload.status }
            : state.selectedReader,
      }
    default:
      return state
  }
}

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(readerReducer, initialState)

  const getReader = (id: string) => {
    return state.readers.find((reader) => reader.id === id)
  }

  const updateReaderStatus = (id: string, status: Reader["status"]) => {
    dispatch({ type: "UPDATE_READER_STATUS", payload: { id, status } })
  }

  return (
    <ReaderContext.Provider
      value={{ state, dispatch, getReader, updateReaderStatus }}
    >
      {children}
    </ReaderContext.Provider>
  )
}

export function useReaders() {
  const context = useContext(ReaderContext)
  if (context === undefined) {
    throw new Error("useReaders must be used within a ReaderProvider")
  }
  return context
}

export type { Reader }
