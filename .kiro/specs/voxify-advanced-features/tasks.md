# Implementation Plan: Voxify Advanced Features

## Overview

Incremental implementation of eight advanced features for the Voxify TTS app. Each task builds on the previous, wiring everything together at the end. All code is TypeScript + React 18 + Tailwind CSS + shadcn/ui.

## Tasks

- [ ] 1. Install dependencies and scaffold new files
  - Run `npm install mammoth pdfjs-dist fast-check vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom` (add vitest config to `vite.config.ts` if not present)
  - Create empty files: `src/hooks/useLocalStorage.ts`, `src/hooks/useFileParser.ts`, `src/components/HighlightedText.tsx`, `src/components/HistoryPanel.tsx`, `src/utils/historyUtils.ts`, `src/utils/textUtils.ts`
  - Create `src/__fixtures__/` directory with a small `sample.txt` fixture file
  - _Requirements: all_

- [ ] 2. Implement `useLocalStorage` hook and utility functions
  - [ ] 2.1 Implement `useLocalStorage<T>(key, defaultValue)` in `src/hooks/useLocalStorage.ts`
    - Read from `localStorage` on mount, handle JSON parse errors by returning `defaultValue`
    - Return `[value, setter]` where setter writes JSON to `localStorage` and updates state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.2, 8.8_

  - [ ] 2.2 Write property tests for `useLocalStorage`
    - **Property 1: VoiceSettings round-trip** — for any valid `VoiceSettings`, write then read returns equal object
    - **Property 2: VoiceSettings default fallback** — for any non-JSON string stored in localStorage, hook returns `defaultValue`
    - **Property 3: SpeechHistory round-trip** — for any string array, write then read returns equal array
    - **Validates: Requirements 2.1, 2.2, 2.4, 2.5, 8.2, 8.8**
    - `// Feature: voxify-advanced-features, Property 1, 2, 3`

- [ ] 3. Implement history utility and `HistoryPanel` component
  - [ ] 3.1 Implement `addToHistory(history, text)` in `src/utils/historyUtils.ts`
    - Skip add if `text === history[0]`; prepend otherwise; trim to max 10 entries
    - _Requirements: 8.1, 8.3_

  - [ ]* 3.2 Write property tests for `addToHistory`
    - **Property 4: SpeechHistory length invariant** — for any sequence of calls, `history.length <= 10`
    - **Property 5: SpeechHistory deduplication at head** — adding existing head entry leaves array unchanged
    - **Validates: Requirements 8.1, 8.3**
    - `// Feature: voxify-advanced-features, Property 4, 5`

  - [ ] 3.3 Implement `HistoryPanel` component in `src/components/HistoryPanel.tsx`
    - Use shadcn/ui `Collapsible` to show/hide the panel
    - Render each history entry with a "Load" button and a "Delete" (X) button
    - Show placeholder text when history is empty
    - Props: `history: string[]`, `onSelect: (text: string) => void`, `onDelete: (index: number) => void`
    - _Requirements: 8.4, 8.5, 8.6, 8.7_

  - [ ]* 3.4 Write unit tests for `HistoryPanel`
    - Test: clicking Load calls `onSelect` with correct text
    - Test: clicking Delete calls `onDelete` with correct index
    - Test: empty history shows placeholder message
    - _Requirements: 8.4, 8.5, 8.6, 8.7_

- [ ] 4. Implement text utility functions and `HighlightedText` component
  - [ ] 4.1 Implement `tokeniseWords(text)` and `getActiveTokenIndex(tokens, charIndex)` in `src/utils/textUtils.ts`
    - `tokeniseWords` returns `WordToken[]` with `{ word, start, end }` for each whitespace-delimited token
    - `getActiveTokenIndex` returns the index of the token whose range contains `charIndex`, or -1
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 4.2 Write property tests for text utilities
    - **Property 7: Word tokenisation coverage** — for any string, tokens cover all non-whitespace chars exactly once
    - **Property 8: Active word index containment** — for any text and charIndex in range, exactly one token contains it
    - **Validates: Requirements 1.1, 1.2**
    - `// Feature: voxify-advanced-features, Property 7, 8`

  - [ ] 4.3 Implement `HighlightedText` component in `src/components/HighlightedText.tsx`
    - Render each `WordToken` as a `<span>` with a space after it
    - Apply `bg-indigo-500/40 text-white rounded px-0.5` highlight class to the active token span
    - Props: `text: string`, `activeWordIndex: number` (-1 = no highlight)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 4.4 Write unit tests for `HighlightedText`
    - Test: active token span has highlight class; others do not
    - Test: `activeWordIndex = -1` renders no highlighted spans
    - _Requirements: 1.2, 1.3, 1.4_

- [ ] 5. Implement counter colour utility and update `TextArea` component
  - [ ] 5.1 Implement `getCounterState(count, limit)` in `src/utils/textUtils.ts`
    - Returns `'neutral' | 'warning' | 'error'` based on thresholds (< 4500 / 4500–4999 / ≥ 5000)
    - _Requirements: 5.3, 5.4, 5.5_

  - [ ]* 5.2 Write property tests for `getCounterState`
    - **Property 10: Counter colour state transitions** — for any integer count, correct state is returned for each range
    - **Validates: Requirements 5.3, 5.4, 5.5**
    - `// Feature: voxify-advanced-features, Property 10`

  - [ ] 5.3 Update `src/components/TextArea.tsx`
    - Add `maxLength` prop (5000); enforce in `onChange` handler — truncate input to `CharLimit` if exceeded
    - Replace the existing char/word counter with a colour-coded counter using `getCounterState`
    - Show "Character limit reached" message when count === 5000
    - Add a hidden `<input type="file" accept=".txt,.rtf,.docx,.pdf">` and a styled trigger button
    - Call `onFileSelect(file)` prop when a file is chosen
    - Props added: `maxLength: number`, `onFileSelect: (file: File) => void`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 3.1_

  - [ ]* 5.4 Write property tests for character limit enforcement
    - **Property 6: Character limit enforcement** — for any string > 5000 chars, truncated result is exactly 5000 chars
    - **Validates: Requirements 5.6, 3.6**
    - `// Feature: voxify-advanced-features, Property 6`

- [ ] 6. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement `useFileParser` hook
  - [ ] 7.1 Implement `useFileParser` in `src/hooks/useFileParser.ts`
    - Enforce 5 MB size limit before reading; show error toast and return early if exceeded
    - `.txt` / `.rtf`: use `FileReader.readAsText`
    - `.docx`: dynamically import `mammoth`, call `mammoth.extractRawText({ arrayBuffer })`
    - `.pdf`: dynamically import `pdfjs-dist`, iterate pages and concatenate `getTextContent()` items
    - After extraction, truncate to 5000 chars and show warning toast if truncated
    - On any error, show descriptive error toast and return `null`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 7.2 Write unit tests for `useFileParser`
    - Test: `.txt` fixture file loads correctly
    - Test: file > 5 MB is rejected with error
    - Test: text > 5000 chars is truncated to exactly 5000
    - Test: FileReader error triggers error toast and returns null
    - _Requirements: 3.2, 3.5, 3.6, 3.7_

- [ ] 8. Extend `useSpeech` hook
  - [ ] 8.1 Add `isPaused`, `activeWordIndex`, `loopMode`, `setLoopMode` to `useSpeech`
    - `isPaused`: set true in `pause()`, false in `resume()` and `stop()`
    - `activeWordIndex`: updated in `utterance.onboundary = (e) => setActiveWordIndex(e.charIndex)`; reset to -1 in `stop()` and `onend`
    - `loopRef`: a `useRef<boolean>` checked in `onend`; if true and not stopped, call `speak()` again with same args
    - `setLoopMode`: updates both `loopMode` state and `loopRef.current`
    - Preserve `activeWordIndex` (do not reset) when `pause()` is called
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 6.3, 6.5, 7.2, 7.4, 7.5_

  - [ ]* 8.2 Write unit tests for `useSpeech` extensions
    - Test: `pause()` sets `isPaused = true`, `isPlaying = false`
    - Test: `resume()` after pause sets `isPaused = false`, `isPlaying = true`
    - Test: `stop()` resets `isPaused`, `isPlaying`, and `activeWordIndex` to -1
    - Test: `stop()` with loop mode enabled does NOT restart speech
    - **Property 9: Loop mode stop invariant** — for any loop-enabled state, stop() results in no restart
    - **Validates: Requirements 6.1, 6.2, 6.3, 7.4**
    - `// Feature: voxify-advanced-features, Property 9`

- [ ] 9. Add dark/light mode toggle
  - [ ] 9.1 Wrap `<App />` in `<ThemeProvider>` in `src/main.tsx`
    - `attribute="class"`, `defaultTheme="dark"`, `storageKey="voxify_theme"`
    - _Requirements: 4.5, 4.6_

  - [ ] 9.2 Add theme toggle button to `src/components/Header.tsx`
    - Use `useTheme()` from `next-themes`; render a `Sun` icon in dark mode and `Moon` icon in light mode
    - On click, call `setTheme(theme === 'dark' ? 'light' : 'dark')`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 10. Wire all features together in `Home.tsx`
  - [ ] 10.1 Initialise voice settings from `useLocalStorage`
    - Replace plain `useState` for `voice`, `rate`, `pitch`, `volume` with `useLocalStorage` reads from `voxify_voice_settings`
    - Persist on every change by calling the `useLocalStorage` setter in each `onXxxChange` handler
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 10.2 Wire speech history
    - Initialise `speechHistory` from `useLocalStorage('voxify_speech_history', [])`
    - In `handlePlay`, call `addToHistory` and persist the updated array
    - Pass `history`, `onSelect`, `onDelete` to `HistoryPanel`; render `HistoryPanel` below the main card
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ] 10.3 Wire file upload
    - Pass `onFileSelect` to `TextAreaInput`; in the handler call `parseFile(file)` from `useFileParser` and set text
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ] 10.4 Wire text highlighting
    - Pass `activeWordIndex` and `isPaused` from `useSpeech` to the render area
    - When `isPlaying || isPaused`, render `<HighlightedText text={text} activeWordIndex={activeWordIndex} />` instead of `<TextAreaInput>`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [ ] 10.5 Wire loop mode and paused state to `Player`
    - Pass `loopMode`, `setLoopMode`, `isPaused` to `Player`
    - In `Player`, add a `Repeat` toggle button for loop mode
    - Change Play button label to "Resume" when `isPaused` is true; on click call `resume()` instead of `speak()`
    - Show a "Paused" badge in the waveform area when `isPaused` is true
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 11. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use **fast-check** with a minimum of 100 iterations each
- Unit tests use **Vitest** + **React Testing Library**
- File parsing libraries (`mammoth`, `pdfjs-dist`) are dynamically imported to keep the initial bundle small
