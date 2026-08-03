# DiscordJS

## Setup

### Requirements

- NodeJS (LTS; including NPM): <https://nodejs.org/en/download/>
- Git: <https://git-scm.com/downloads>

### Download

Download the current [source code here](https://git.baipyr.us/Baipyrus/DiscordJS-Example/archive/main.zip).

Or clone the repository manually:

```bash
git clone https://git.baipyr.us/Baipyrus/DiscordJS-Example.git
```

### Installation

Install the required dependencies:

```bash
npm install
```

### Running

Register or update your commands for Discord with:

```bash
npm run deploy
```

Start the bot in development mode with:

```bash
npm run dev
```

## Usage

Discord utilizes different types of commands to interface with bots.
The following explanations aim to explain these types.

### Slash Commands

Simple text-based commands. Can be entered in any Text-Based-Channel.

Prefix message with a "Slash" (`/`) and begin typing the name of the command!
This prefix and the styling as a code snippet will be used to highlight
Slash Commands in this message.

For clarification, this will also highlight command options as
"Slash Command only" by prefixing them with an underscore (`_`)

### Context Menu Commands

"One click" commands. Listed under context (right click) menus,
under the group "Apps".

Ideally, clicking on Users or Messages, you can apply any type of command with the
press of a button. Comes with the downside of lacking further input capabilities.

Under the list of names of any given command, there may be a quoted string.
These are meant to highlight context menu capabilities for the current command,
by showcasing the commands name in the quote.

## TO-DO List

> **NOTE**
> These lists can and will easily be appended to in the future.
> Any and all feedback is greatly appreciated!

### Planned features

None

### Quirks/Bugs

None

### Changes

None
