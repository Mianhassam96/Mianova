# Requirements Document

## Introduction

Voxify is a React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui Text-to-Speech web application. This document specifies requirements for eight advanced features to be added to the existing app: text highlighting during speech, persistent voice settings, file upload support, dark/light mode toggle, character counter with limit enforcement, resume-from-pause, loop/repeat mode, and speech history. The app already has download audio, multi-language voice selection, and partial dark mode CSS variables in place.

## Glossary

- **App**: The Voxify React web application
- **SpeechSynthesis**: The browser's built-in Web Speech API (`window.speechSynthesis`)
- **Utterance**: A `SpeechSynthesisUtterance` instance representing a unit of speech
- **Boundary_Event**: A `SpeechSynthesisUtterance` `onboundary` event fired when the synthesizer reaches a word or sentence boundary
- **Word_Index**: The character offset of the currently spoken word within the full text string
- **VoiceSettings**: The persisted set of voice, rate, pitch, and volume values
- **LocalStorage**: The browser's `window.localStorage` key-value store
- **FileReader**: The browser's `FileReader` API used to read local file contents
- **ThemeProvider**: The `next-themes` `ThemeProvider` component that manages dark/light class on the root element
- **CharLimit**: The maximum allowed character count for the text input, set to 5000
- **SpeechHistory**: The ordered list of up to 10 most recently spoken text strings, persisted in LocalStorage
- **LoopMode**: A toggle state that causes speech to automatically restart when the current utterance ends
- **HighlightSpan**: A `<span>` element wrapping a word in the rendered text display that receives a highlight style when that word is being spoken

---

## Requirements

### Requirement 1: Text Highlight While Speaking

**User Story:** As a user, I want words to be highlighted in the text display as they are spoken, so that I can follow along with the speech in real time.

#### Acceptance Criteria

1. WHEN speech begins, THE App SHALL split the input text into individual word tokens and render each token as a separate HighlightSpan element.
2. WHEN a Boundary_Event fires with `charIndex` pointing to a word, THE App SHALL apply a highlight style to the HighlightSpan whose character range contains that Word_Index.
3. WHEN a new word boundary is reached, THE App SHALL remove the highlight from the previously highlighted HighlightSpan and apply it to the current one.
4. WHEN speech is stopped or ends, THE App SHALL remove all highlight styles from all HighlightSpan elements.
5. WHILE speech is paused, THE App SHALL preserve the highlight on the last spoken word.
6. IF the browser does not fire `onboundary` events, THE App SHALL display the text without highlighting and continue speech playback normally.

---

### Requirement 2: Save Voice Settings

**User Story:** As a user, I want my voice, rate, pitch, and volume settings to be saved automatically, so that I do not have to reconfigure them every time I open the app.

#### Acceptance Criteria

1. WHEN the user changes the voice, rate, pitch, or volume value, THE App SHALL persist the updated VoiceSettings object to LocalStorage under the key `voxify_voice_settings` within 500ms.
2. WHEN the App initialises, THE App SHALL read VoiceSettings from LocalStorage and apply them as the initial state for voice, rate, pitch, and volume controls.
3. IF no VoiceSettings entry exists in LocalStorage on initialisation, THE App SHALL apply the default values: rate 1.0, pitch 1.0, volume 1.0, and the first available voice.
4. IF the stored VoiceSettings value cannot be parsed as valid JSON, THE App SHALL discard it and apply the default values.
5. THE App SHALL store VoiceSettings as a JSON object containing the fields `voice` (string), `rate` (number), `pitch` (number), and `volume` (number).

---

### Requirement 3: Upload Text File

**User Story:** As a user, I want to upload a text file (.txt, .rtf, .docx, or .pdf) so that I can load its content into the text area without manual copy-paste.

#### Acceptance Criteria

1. THE App SHALL provide a file upload control that accepts files with extensions `.txt`, `.rtf`, `.docx`, and `.pdf`.
2. WHEN a `.txt` or `.rtf` file is selected, THE App SHALL read the file using FileReader and load the plain text content into the text area.
3. WHEN a `.docx` file is selected, THE App SHALL extract the plain text content from the file and load it into the text area.
4. WHEN a `.pdf` file is selected, THE App SHALL extract the plain text content from the file and load it into the text area.
5. IF the selected file exceeds 5 MB in size, THE App SHALL reject the file, display an error message, and leave the text area unchanged.
6. IF the file content after extraction exceeds CharLimit characters, THE App SHALL truncate the loaded text to CharLimit characters and display a warning to the user.
7. IF a file read or parse error occurs, THE App SHALL display a descriptive error message and leave the text area unchanged.
8. WHEN a file is successfully loaded, THE App SHALL replace the current text area content with the extracted text.

---

### Requirement 4: Dark/Light Mode Toggle

**User Story:** As a user, I want to toggle between dark and light themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL provide a visible toggle control in the header area that switches between dark and light mode.
2. WHEN the user activates the toggle, THE ThemeProvider SHALL switch the active theme between `dark` and `light`.
3. WHEN the theme is set to `dark`, THE App SHALL apply the `.dark` CSS class to the root element, activating the dark colour variables defined in `index.css`.
4. WHEN the theme is set to `light`, THE App SHALL remove the `.dark` CSS class from the root element, activating the light colour variables.
5. THE ThemeProvider SHALL persist the selected theme to LocalStorage so that the chosen theme is restored on the next page load.
6. WHEN the App initialises without a stored theme preference, THE ThemeProvider SHALL default to `dark` mode.

---

### Requirement 5: Character Counter and Limit

**User Story:** As a user, I want to see a live character count and be warned when I approach or reach the 5000-character limit, so that I know when my text is too long.

#### Acceptance Criteria

1. THE App SHALL display the current character count of the text area content at all times.
2. THE App SHALL display the CharLimit value (5000) alongside the current count so the user can see the remaining capacity.
3. WHEN the character count is below 4500, THE App SHALL display the counter in a neutral style.
4. WHEN the character count is between 4500 and 4999 inclusive, THE App SHALL display the counter in a warning style (amber/yellow colour).
5. WHEN the character count equals or exceeds CharLimit (5000), THE App SHALL display the counter in an error style (red colour).
6. WHEN the user attempts to type or paste text that would cause the character count to exceed CharLimit, THE App SHALL prevent the additional characters from being added and maintain the text at exactly CharLimit characters.
7. WHEN the character count equals CharLimit, THE App SHALL display a message informing the user that the limit has been reached.

---

### Requirement 6: Resume from Pause

**User Story:** As a user, I want speech to resume from exactly where it was paused, so that I do not lose my place in long texts.

#### Acceptance Criteria

1. WHEN the user clicks Pause during speech, THE App SHALL call `SpeechSynthesis.pause()` to suspend the current Utterance at its current position.
2. WHEN the user clicks Play after a pause, THE App SHALL call `SpeechSynthesis.resume()` to continue the Utterance from the suspended position rather than restarting from the beginning.
3. WHEN the user clicks Stop, THE App SHALL call `SpeechSynthesis.cancel()` and reset the playback position so that the next Play starts from the beginning of the text.
4. WHILE speech is paused, THE App SHALL display a visual indicator distinguishing the paused state from the stopped state.
5. IF `SpeechSynthesis.resume()` is called when no utterance is paused, THE App SHALL start a new utterance from the beginning of the text.

---

### Requirement 7: Repeat / Loop Mode

**User Story:** As a user, I want to enable a loop mode so that speech automatically repeats when it finishes, so that I can listen to content on repeat without manual interaction.

#### Acceptance Criteria

1. THE App SHALL provide a toggle button that enables or disables LoopMode.
2. WHEN LoopMode is enabled and the current Utterance ends naturally, THE App SHALL automatically start a new Utterance with the same text and settings.
3. WHEN LoopMode is enabled, THE App SHALL display a visual indicator showing that loop mode is active.
4. WHEN the user clicks Stop while LoopMode is enabled, THE App SHALL cancel the current Utterance and SHALL NOT start a new one.
5. WHEN LoopMode is disabled while speech is playing, THE App SHALL allow the current Utterance to finish and SHALL NOT restart it.
6. WHEN LoopMode is toggled, THE App SHALL preserve the current playback state (playing or paused).

---

### Requirement 8: Speech History

**User Story:** As a user, I want to see a history of the last 10 texts I have spoken, so that I can quickly reuse previous content without retyping it.

#### Acceptance Criteria

1. WHEN the user initiates speech playback, THE App SHALL add the current text to SpeechHistory if it is not already the most recent entry.
2. THE App SHALL store SpeechHistory in LocalStorage under the key `voxify_speech_history` as a JSON array of strings.
3. THE App SHALL retain at most 10 entries in SpeechHistory; WHEN a new entry would exceed 10, THE App SHALL remove the oldest entry.
4. THE App SHALL display SpeechHistory entries in a collapsible panel, ordered from most recent to oldest.
5. WHEN the user clicks a SpeechHistory entry, THE App SHALL load that text into the text area.
6. WHEN the user clicks a delete control on a SpeechHistory entry, THE App SHALL remove that entry from SpeechHistory and update LocalStorage.
7. WHEN SpeechHistory is empty, THE App SHALL display a placeholder message in the history panel.
8. IF the stored SpeechHistory value cannot be parsed as valid JSON, THE App SHALL discard it and initialise SpeechHistory as an empty array.
