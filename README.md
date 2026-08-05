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

## Keyword mentions

### Name

`/keyword`

### Description

Register specific keywords that the bot will listen for in every message on
this server. Once mentioned, a random selection of registered responses is made
and the bot will send the selected message as a chat response to the original user!

### Subcommands

#### add

Full names:

- `/keyword add`

Description:

Adds a new keyword to the database to be listened for in this server.

Options:

- \_keyword: String

#### remove

Full names:

- `/keyword remove`

Description:

Removes a keyword from the database of this server.
Uses auto complete to help fill out all options.

Options:

- \_keyword: String

#### list

Full names:

- `/keyword list`

Description:

Lists all registered keywords used in this server.

#### info

Full names:

- `/keyword info`
- "Show keyword details"

Description:

Lists all registered responses associated with a keyword in this server.
Uses auto complete to help fill out all options.

Options:

- \_keyword: String

### Automated tasks

All messages in this server are scanned for keywords contained in them.

## Randomized responses

### Name

`/response`

### Description

Register messages to be sent automatically by the bot once a keyword has been mentioned.
Response messages are tied directly to their keyword in this server. When a keyword
has multiple messages associated with it, a random selection is made. When a user
sends a message containing multiple keywords, all response messages are considered
in the random selection.

### Subcommands

#### add

Full names:

- `/response add`

Description:

Adds a new response to the database to be listened for in this server.
The input is submitted through a pop-up modal that will open once the
corresponding keyword is provided and the command is sent.
Response messages are given names to better differentiate them
without having to list all their content on every reference.
Uses auto complete to help fill out all options.

Options:

- \_keyword: String

#### remove

Full names:

- `/response remove`

Description:

Removes a specific response from the database of this server.
Uses auto complete to help fill out all options.

Options:

- \_keyword: String
- \_name: String

#### list

Full names:

- `/response list`
- "Show keyword details"

Description:

Lists all registered responses associated with a keyword in this server.
Provides the same exact functionality as `/keyword info`.
Uses auto complete to help fill out all options.

Options:

- \_keyword: String

#### info

Full names:

- `/response info`

Description:

Shows the exact response details in the format of:

```text
Response 'NAME': `MESSAGE`
```

Uses auto complete to help fill out all options.

Options:

- \_keyword: String
- \_name: String

### Automated tasks

Registered responses will be used to reply to a user once
an associated keyword is mentioned in this server.

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
