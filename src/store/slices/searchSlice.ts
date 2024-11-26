import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import type { Transaction } from '@/types/transaction'

// Arama durumu için tip tanımlamaları
export interface SearchState {
  query: string
  results: Transaction[]
  isSearching: boolean
}

// Başlangıç durumu
const initialState: SearchState = {
  query: '',
  results: [],
  isSearching: false
}

// Search slice oluşturma
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    setSearchResults: (state, action: PayloadAction<Transaction[]>) => {
      state.results = action.payload
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload
    },
    clearSearch: (state) => {
      state.query = ''
      state.results = []
      state.isSearching = false
    }
  }
})

// Selectors
const selectSearchState = (state: RootState) => state.search

export const selectSearchQuery = createSelector(
  [selectSearchState],
  (search) => search.query
)

export const selectSearchResults = createSelector(
  [selectSearchState],
  (search) => search.results
)

export const selectIsSearching = createSelector(
  [selectSearchState],
  (search) => search.isSearching
)

// Actions ve reducer dışa aktarma
export const { 
  setSearchQuery, 
  setSearchResults, 
  setIsSearching,
  clearSearch 
} = searchSlice.actions

export default searchSlice.reducer
